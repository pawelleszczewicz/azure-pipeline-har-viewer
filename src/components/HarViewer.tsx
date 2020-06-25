import * as React from "react"
import { forwardRef } from 'react'
import { Search, Clear, ChevronRight } from '@material-ui/icons' 
import * as SDK from "azure-devops-extension-sdk"
import MaterialTable from 'material-table'
import RequestDetails from './RequestDetails'

function parseRequests(entries) {
    let rows = []
    entries.forEach(element => {
        const row = {
            method: element.request.method ? element.request.method : '',
            url: element.request.url ? element.request.url : '',
            statusCode: element.response.status ? element.response.status : '',
            request: {
                body: element.request.postData ? JSON.parse(element.request.postData.text) : {},
                headers: element.request.headers ? element.request.headers : [],
                cookies: element.request.cookies ? element.request.cookies : [],
                parameters: element.request.queryString ? element.request.queryString : []
            },
            response: {
                body: element.response.content.text ? JSON.parse(element.response.content.text) : {},
                headers: element.response.headers ? element.response.headers : [],
                cookies: element.response.cookies ? element.response.cookies : []
            },
            timings: element.timings ? element.timings : {}
        }
        rows.push(row)
    }) 
    return rows
}

interface State {
    content: []
}

export default class HarViewer extends React.Component{
    state: State
    props: any 
    constructor(props) {
        super(props)
    }
    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        }) 
    }

    async componentDidMount() {
        const accessToken = await SDK.getAccessToken()
        const b64encodedAuth = Buffer.from(':' + accessToken).toString('base64')
        const authHeaders = { headers: {'Authorization': 'Basic ' + b64encodedAuth} }
        const response = await fetch(this.props.data.fileUrl, authHeaders)
        if (!response.ok) {
            throw new Error(response.statusText)
        }
    
        const responseText = await response.text()
        const content = parseRequests((JSON.parse(responseText)).log.entries)
        await this.setStateAsync({content:  content})
    }

    render () {
        if (this.state === null) return null
        return (
            <MaterialTable
                columns={[
                    { title: 'Method', field: 'method', width: 70 },
                    { title: 'URL', field: 'url', cellStyle: {} },
                    { title: 'Status Code', field: 'statusCode', type: 'numeric', width: 70 },
                ]}
                data={this.state.content}
                options={{
                    emptyRowsWhenPaging: false,
                    paging: false,
                    padding: 'dense',
                    grouping: false,
                    draggable: false,
                    sorting:false,
                    showTitle: false,
                    rowStyle: rowData => ({
                        color: (rowData.statusCode >= 400) ? '#FF0000' : '#000000'
                    })
                }}
                icons={{
                    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
                    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
                    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
                    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
                }}
                detailPanel={rowData => {
                    return (
                        <RequestDetails data = {rowData} />
                    )
                }}
                onRowClick={(event, rowData, togglePanel) => togglePanel()}
            />
        )    
    }
}
