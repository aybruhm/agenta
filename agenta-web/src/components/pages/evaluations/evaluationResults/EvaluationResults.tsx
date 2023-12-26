import React, {useEffect, useMemo, useState} from "react"
import {AgGridReact} from "ag-grid-react"
import {useAppTheme} from "@/components/Layout/ThemeContextProvider"
import {ColDef, ICellRendererParams} from "ag-grid-community"
import {createUseStyles} from "react-jss"
import {Button, GlobalToken, Space, Spin, Typography, theme} from "antd"
import {DeleteOutlined, PlusCircleOutlined, SlidersOutlined, SwapOutlined} from "@ant-design/icons"
import {EvaluationStatus, _Evaluation} from "@/lib/Types"
import {uniqBy} from "lodash"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import duration from "dayjs/plugin/duration"
import NewEvaluationModal from "./NewEvaluationModal"
import {useAppId} from "@/hooks/useAppId"
import {fetchAllEvaluations} from "@/services/evaluations"
import {useRouter} from "next/router"
dayjs.extend(relativeTime)
dayjs.extend(duration)

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    table: {
        height: 500,
    },
    buttonsGroup: {
        alignSelf: "flex-end",
    },
    statusCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        height: "100%",
        marginBottom: 0,

        "& > div:nth-of-type(1)": {
            width: 6,
            height: 6,
            borderRadius: "50%",
        },
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: "50%",
        backgroundColor: "#444",
    },
})

const statusMapper = (token: GlobalToken) => ({
    [EvaluationStatus.INITIALIZED]: {
        label: "Queued",
        color: token.colorTextSecondary,
    },
    [EvaluationStatus.STARTED]: {
        label: "Running",
        color: token.colorWarning,
    },
    [EvaluationStatus.FINISHED]: {
        label: "Completed",
        color: token.colorSuccess,
    },
    [EvaluationStatus.ERROR]: {
        label: "Failed",
        color: token.colorError,
    },
})

interface Props {}

const EvaluationResults: React.FC<Props> = () => {
    const {appTheme} = useAppTheme()
    const classes = useStyles()
    const appId = useAppId()
    const router = useRouter()
    const [evaluations, setEvaluations] = useState<_Evaluation[]>([])
    const [newEvalModalOpen, setNewEvalModalOpen] = useState(false)
    const [fetching, setFetching] = useState(false)
    const {token} = theme.useToken()

    const fetcher = () => {
        setFetching(true)
        fetchAllEvaluations(appId)
            .then(setEvaluations)
            .catch(console.error)
            .finally(() => setFetching(false))
    }

    useEffect(() => {
        fetcher()
    }, [appId])

    const evaluatorConfigs = useMemo(
        () =>
            uniqBy(
                evaluations
                    .map((item) => item.aggregated_results.map((item) => item.evaluator_config))
                    .flat(),
                "id",
            ),
        [evaluations],
    )

    const colDefs = useMemo(() => {
        const colDefs: ColDef<_Evaluation>[] = [
            {field: "testset.name"},
            {
                field: "variants",
                valueGetter: (params) => params.data?.variants[0].variantName,
                headerName: "Variant",
            },
            ...evaluatorConfigs.map(
                (config) =>
                    ({
                        field: "aggregated_results",
                        headerComponent: () => (
                            <span>
                                <SlidersOutlined /> {config.name}
                            </span>
                        ),
                        valueGetter: (params) =>
                            params.data?.aggregated_results.find(
                                (item) => item.evaluator_config.id === config.id,
                            )?.result?.value || "",
                    }) as ColDef<_Evaluation>,
            ),
            {
                field: "status",
                cellRenderer: (params: ICellRendererParams<_Evaluation>) => {
                    const classes = useStyles()
                    const {label, color} = statusMapper(token)[params.value as EvaluationStatus]

                    return (
                        <Typography.Text className={classes.statusCell}>
                            <div style={{backgroundColor: color}} />
                            <span>{label}</span>
                            <span className={classes.dot}></span>
                            <span style={{color: token.colorTextSecondary}}>
                                {dayjs
                                    .duration(params.data?.duration || 0, "milliseconds")
                                    .humanize()}
                            </span>
                        </Typography.Text>
                    )
                },
            },
            {
                field: "created_at",
                headerName: "Created",
                valueFormatter: (params) => dayjs(params.value).fromNow(),
            },
        ]
        return colDefs
    }, [evaluatorConfigs])

    return (
        <div className={classes.root}>
            <Space className={classes.buttonsGroup}>
                <Button icon={<DeleteOutlined />} type="primary" danger>
                    Delete
                </Button>
                <Button icon={<SwapOutlined />} type="primary">
                    Compare
                </Button>
                <Button
                    icon={<PlusCircleOutlined />}
                    type="primary"
                    onClick={() => setNewEvalModalOpen(true)}
                >
                    New Evaluation
                </Button>
            </Space>
            <Spin spinning={fetching}>
                <div
                    className={`${
                        appTheme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"
                    } ${classes.table}`}
                >
                    <AgGridReact<_Evaluation>
                        rowData={evaluations}
                        columnDefs={colDefs}
                        getRowId={(params) => params.data.id}
                        onRowClicked={(params) =>
                            router.push(`/${router.asPath}/${params.data?.id}`)
                        }
                    />
                </div>
            </Spin>

            <NewEvaluationModal
                open={newEvalModalOpen}
                onCancel={() => setNewEvalModalOpen(false)}
                onSuccess={() => {
                    setNewEvalModalOpen(false)
                    fetcher()
                }}
            />
        </div>
    )
}

export default EvaluationResults