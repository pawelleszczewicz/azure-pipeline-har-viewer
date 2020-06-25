const fse = require('fs-extra');
const tl = require('azure-pipelines-task-lib');
const { basename, resolve } = require('path');
const dashify = require('dashify')
try {
    let harDir = tl.getPathInput('harDir', true, true);
    let filterInput = tl.getInput('filterInput')
    let hars = fse.readdirSync(harDir).filter(har => har.endsWith('.har'));
    const jobName = dashify(tl.getVariable('Agent.JobName'))
    const stageName = dashify(tl.getVariable('System.StageDisplayName'))
    const stageAttempt = tl.getVariable('System.StageAttempt')
    const tabName = tl.getInput('tabName', false ) || 'HAR-Viewer'
    hars.forEach(har => {
        const harPath = resolve(harDir, har)
        const fileName = basename(har).split('.')[0]
        if(filterInput !== undefined) {
            const harObj = JSON.parse(fse.readFileSync(harPath))
            const entries = harObj.log.entries
            let newEntries = []
            for (let entry of entries) {
                if (entry.request.url.indexOf(filterInput) > 0) {
                    newEntries.push(entry)
                }
            }
            harObj.log.entries = newEntries
            fse.writeFileSync(harPath, JSON.stringify(harObj))
        }
        tl.addAttachment('har-file', `${tabName}.${jobName}.${stageName}.${stageAttempt}.${fileName}`, harPath)
    })
} catch (error) {
    tl.setResult(tl.TaskResult.SucceededWithIssues, error.message);
}
