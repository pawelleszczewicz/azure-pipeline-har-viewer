
import * as React from "react"
import { Tabs, Tab, Typography, Box, makeStyles } from '@material-ui/core'
import MaterialTable from 'material-table'
import * as ObjectInspector from 'react-object-inspector'

function TabPanel(props) {
    const { children, value, index } = props
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`${index}`}
        >
            {value === index && (
            <Box >
                <Typography component="div">{children}</Typography>
            </Box>
            )}
        </div>
    )
}

function getData(data) {
    let rows = []
    data.forEach(entry => {
        const row = {
            name: entry.name,
            value: entry.value
        }
        rows.push(row)
    })
    return rows
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    json: {
        paddingRight: 20,
        paddingTop: 20,
        paddingLeft: 20,
        minHeight: 30
    }
}))

export default function RequestDetails(props) {
    const classes = useStyles()
    const [value, setValue] = React.useState(0)
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    return (
        <>
            <Tabs value={value} onChange={handleChange} >
                <Tab label="Request Parameters"/>
                <Tab label="Request Headers"/>
                <Tab label="Request Body"/>
                <Tab label="Response Headers"/>
                <Tab label="Response Body"/>
                <Tab label="Cookies"/>
            </Tabs>
            <TabPanel value={value} index={0}>
                <MaterialTable 
                    columns={[
                        { title: 'Name', field: 'name', width: 300 },
                        { title: 'Value', field: 'value' }
                    ]}
                    data={getData(props.data.request.parameters)}
                    options={{
                        emptyRowsWhenPaging: false,
                        paging: false,
                        search: false,
                        showTitle: false,
                        header: false,
                        padding: "dense",
                        grouping: false
                    }}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <MaterialTable 
                    columns={[
                        { title: 'Name', field: 'name', width: 300 },
                        { title: 'Value', field: 'value' }
                    ]}
                    data={getData(props.data.request.headers)}
                    options={{
                        emptyRowsWhenPaging: false,
                        paging: false,
                        search: false,
                        showTitle: false,
                        header: false,
                        padding: "dense",
                        grouping: false
                    }}
                />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <div className={classes.json}>
                    <ObjectInspector data={ props.data.request.body } />
                </div>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <MaterialTable 
                    columns={[
                        { title: 'Name', field: 'name', width: 300 },
                        { title: 'Value', field: 'value' }
                    ]}
                    data={getData(props.data.response.headers)}
                    options={{
                        emptyRowsWhenPaging: false,
                        paging: false,
                        search: false,
                        showTitle: false,
                        header: false,
                        padding: "dense",
                        grouping: false
                    }}
                />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <div className={classes.json}>
                    <ObjectInspector data={ props.data.response.body } />
                </div>
            </TabPanel>
            <TabPanel value={value} index={5}>
                <MaterialTable 
                    columns={[
                        { title: 'Name', field: 'name', width: 300 },
                        { title: 'Value', field: 'value' }
                    ]}
                    data={getData(props.data.request.cookies)}
                    title='Request Cookies'
                    options={{
                        emptyRowsWhenPaging: false,
                        paging: false,
                        search: false,
                        header: false,
                        padding: "dense",
                        grouping: false
                    }}
                />
                <MaterialTable 
                    columns={[
                        { title: 'Name', field: 'name', width: 300 },
                        { title: 'Value', field: 'value' }
                    ]}
                    data={getData(props.data.response.cookies)}
                    title='Response Cookies'
                    options={{
                        emptyRowsWhenPaging: false,
                        paging: false,
                        search: false,
                        header: false,
                        padding: "dense",
                        grouping: false
                    }}
                />
            </TabPanel>
        </>
    )
}
