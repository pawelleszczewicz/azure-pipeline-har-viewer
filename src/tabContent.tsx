import "./tabContent.scss"
import * as React from "react"
import * as ReactDOM from "react-dom"
import * as SDK from "azure-devops-extension-sdk"
import fetch from "node-fetch"
import { getClient } from "azure-devops-extension-api"
import { Build, BuildRestClient, Attachment } from "azure-devops-extension-api/Build"
import { ObservableValue, ObservableObject } from "azure-devops-ui/Core/Observable"
import { Observer } from "azure-devops-ui/Observer"
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs"

import HarFileList from './components/HarFileList'

const ATTACHMENT_TYPE = "har-file"
const OUR_TASK_IDS = [
    "d8cf2910-a49c-11ea-af4d-25cddbb947e8"
]

SDK.init()
SDK.ready().then(() => {
    try {
        const config = SDK.getConfiguration()
        config.onBuildChanged((build: Build) => {
        let attachmentClient = new AttachmentClient(build)
        attachmentClient.init().then(() => {
            displayHarFiles(attachmentClient)
        }).catch(error => {throw new Error(error)})
        })
    } catch(error) {
        throw new Error(error)
    }
})

function displayHarFiles(attachmentClient: AttachmentClient) {
    ReactDOM.render(<TaskAttachmentPanel attachmentClient={attachmentClient} />, document.getElementById("har-viewer-ext-container"))
}

SDK.register('registerRelease', {
    isInvisible: function (state) {
        let resultArray = []
        state.releaseEnvironment.deployPhasesSnapshot.forEach(phase => {
            phase.workflowTasks.forEach(task => {
                resultArray.push(task.taskId)
            })
        })
        return !OUR_TASK_IDS.some(id => resultArray.includes(id))
    }
})

class AttachmentClient {
    private attachments: Attachment[] = []
    private build: Build

    constructor(build: Build) {
        this.build = build
    }

    public async init() {
        console.log('Get attachments list')
        const buildClient: BuildRestClient = getClient(BuildRestClient)
        this.attachments = await buildClient.getAttachments(this.build.project.id, this.build.id, ATTACHMENT_TYPE)
    }
    public getAttachments() : Attachment[] {
        return this.attachments
    }
}

interface TaskAttachmentPanelProps {
    attachmentClient: AttachmentClient
}

export default class TaskAttachmentPanel extends React.Component<TaskAttachmentPanelProps> {
    private selectedTabId: ObservableValue<string>
    private tabContents: ObservableObject<string>
    private tabInitialContent: string = '<div class="wide"><p>Loading...</p></div>'

    constructor(props: TaskAttachmentPanelProps) {
        super(props)
        this.tabContents = new ObservableObject()
    }

    public render() {
        const attachments = this.props.attachmentClient.getAttachments()
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index
        }
        if (attachments.length == 0) {
            return (null)
        } else {
            const tabs = []
            const stages = attachments.map(attachment => {
                const splitName = attachment.name.split('.')
                splitName.pop()
                return splitName.join('.')
            })
            const uniqueStages = stages.filter(onlyUnique)
            let newAttachments = []
            for (const stage of uniqueStages) {
                const metadata = stage.split('.')
                let name: string
                // Conditionally add counter for multistage pipeline
                if (metadata[0] === 'HAR-Viewer') {
                    name = (metadata[2] !== '__default' && uniqueStages.length > 1) ? `${metadata[2]}-${metadata[1]} #${metadata[3]}` : `${metadata[2]}-${metadata[1]}`
                } else {
                    name = (metadata[2] !== '__default' && uniqueStages.length > 1) ? `${metadata[0]} #${metadata[3]}` : metadata[0]
                }
                for (const attachment of attachments) {
                    if (attachment.name.indexOf(stage) > -1) {
                        const newAttachment = {
                                stage: stage,
                                name: attachment.name.split('.').pop(),
                                url: attachment._links.self.href
                            }
                        newAttachments.push(newAttachment)
                    }
                }

                tabs.push(<Tab name={name} id={stage} key={stage} />)
                this.tabContents.add(stage, this.tabInitialContent)
            }
            this.selectedTabId = new ObservableValue(uniqueStages[0])

            return (
                <div className="flex-column">
                    { uniqueStages.length > 1 ?
                        <TabBar
                            onSelectedTabChanged={this.onSelectedTabChanged}
                            selectedTabId={this.selectedTabId}
                            tabSize={TabSize.Tall}>
                            {tabs}
                        </TabBar>
                    : null }
                    <Observer selectedTabId={this.selectedTabId} tabContents={this.tabContents}>
                        {(props: { selectedTabId: string }) => {
                            const att = newAttachments.filter(attachment => attachment.stage === props.selectedTabId)
                            return <HarFileList attachments={att} />
                        }}
                    </Observer>
                </div>
            )
        }
    }

    private onSelectedTabChanged = (newTabId: string) => {
        this.selectedTabId.value = newTabId
    }
}
