import * as React from "react"
import { forwardRef } from 'react'
import { Search, Clear, ChevronRight } from '@material-ui/icons'
import MaterialTable from 'material-table'

import HarViewer from './HarViewer'

export default class HarFileList extends React.Component{
    props: any
    constructor(props) {
        super(props)
    }
    render() {
        let rows = []
        this.props.attachments.forEach(attachment => {
            const row = {
                fileName: attachment.name,
                fileUrl: attachment.url
            }
            rows.push(row)
            return rows
        })
        return (
            <MaterialTable
                columns = {[
                    { title: 'HAR file name', field: 'fileName' }
                ]}
                data={rows}
                options={{
                    search: false,
                    emptyRowsWhenPaging: false,
                    paging: false,
                    showTitle: false,
                    padding: 'dense',
                    grouping: false,
                    draggable: false,
                    sorting: false,
                }}
                icons={{
                    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
                    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
                    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
                    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
                }}
                detailPanel={rowData => {
                    return (
                        <HarViewer data={rowData} />
                    )
                }}
                onRowClick={(event, rowData, togglePanel) => togglePanel()}
            />
        )
    }
}
