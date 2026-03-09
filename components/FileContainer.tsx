/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useRef, useState, useReducer} from "react"
import {useUpscaleSelector, useActionSelector, useThemeSelector} from "../store"
import {ProgressBar} from "react-bootstrap"
import pSBC from "shade-blend-color"
import RightArrowIcon from "../assets/svg/right-arrow.svg"
import ContractIcon from "../assets/svg/contract.svg"
import ExpandIcon from "../assets/svg/expand.svg"
import CloseContainerIcon from "../assets/svg/close-container.svg"
import LocationIcon from "../assets/svg/location.svg"
import TrashIcon from "../assets/svg/trash.svg"
import functions from "../structures/functions"
import "./styles/filecontainer.less"

interface FileContainerProps {
    id: number
    remove: (id: number) => void
    setStart: (id: number) => void
    type: "image" | "gif" | "animated webp" | "animated png" | "video" | "pdf"
    source: string
    height: number
    width: number
    framerate?: number
    image?: string
}

let realEvent = true
let mouseStopped = false
let timer = null as any

const FileContainer: React.FunctionComponent<FileContainerProps> = (props: FileContainerProps) => {
    const {theme} = useThemeSelector()
    const {videoQuality, gifQuality, pngCompression, jpgQuality, parallelFrames, threads, 
        rename, pitch, sdColorSpace, gifTransparency, upscaler, compress, pngFrames, pdfDownscale, 
        pythonDownscale, fpsMultiplier, speed, scale, directory, noise, mode, reverse
    } = useUpscaleSelector()
    const {previewVisible} = useActionSelector()
    const [hover, setHover] = useState(false)
    const [output, setOutput] = useState("")
    const [outputImage, setOutputImage] = useState("")
    const [started, setStarted] = useState(false)
    const [stopped, setStopped] = useState(false)
    const [deleted, setDeleted] = useState(false)
    const [progress, setProgress] = useState(null) as any
    const [interlopProgress, setInterlopProgress] = useState(null) as any
    const [frame, setFrame] = useState("")
    const [frames, setFrames] = useState("")
    const [progressColor, setProgressColor] = useState("")
    const [backgroundColor, setBackgroundColor] = useState("")
    const [lockedStats, setLockedStats] = useState({}) as any
    const [progressLock, setProgressLock] = useState(false)
    const [startSignal, setStartSignal] = useState(false)
    const [clearSignal, setClearSignal] = useState(false)
    const [drag, setDrag] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const progressBarRef = useRef<HTMLDivElement>(null)
    const fileContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const conversionStarted = (event: any, info: {id: number}) => {
            if (info.id === props.id) {
                setStarted(true)
                props.setStart(props.id)
            }
        }
        const conversionProgress = (event: any, info: {id: number, current: number, total: number, frame: string, percent?: number}) => {
            if (info.id === props.id) {
                const newProgress = info.percent ? info.percent : (info.current / info.total) * 100
                if (progress !== newProgress) {
                    setProgress(newProgress)
                    if (info.frame) {
                        setFrame(info.frame)
                        setFrames(`${info.current} / ${info.total}`)
                    }
                }
            }
        }
        const interpolationProgress = (event: any, info: {id: number, percent?: number}) => {
            if (info.id === props.id) {
                const newProgress = info.percent
                if (interlopProgress !== newProgress) {
                    if (newProgress) setInterlopProgress(newProgress)
                }
            }
        }
        const conversionFinished = (event: any, info: {id: number, output: string, outputImage?: string}) => {
            if (info.id === props.id) {
                setOutput(info.output)
                if (info.outputImage) setOutputImage(info.outputImage)
                setFrame("")
                setShowNew(true)
            }
        }
        const startAll = () => {
            setStartSignal(true)
        }
        const clearAll = () => {
            setClearSignal(true)
        }
        const checkMouseStop = () => {
            mouseStopped = false
            clearTimeout(timer)
            timer =  setTimeout(() => {mouseStopped = true}, 200)
        }
        window.ipcRenderer.on("conversion-started", conversionStarted)
        window.ipcRenderer.on("conversion-progress", conversionProgress)
        window.ipcRenderer.on("interpolation-progress", interpolationProgress)
        window.ipcRenderer.on("conversion-finished", conversionFinished)
        window.ipcRenderer.on("start-all", startAll)
        window.ipcRenderer.on("clear-all", clearAll)
        window.ipcRenderer.on("update-color", forceUpdate)
        window.addEventListener("mousemove", checkMouseStop)
        return () => {
            window.ipcRenderer.removeListener("conversion-started", conversionStarted)
            window.ipcRenderer.removeListener("conversion-progress", conversionProgress)
            window.ipcRenderer.removeListener("interpolation-progress", interpolationProgress)
            window.ipcRenderer.removeListener("conversion-finished", conversionFinished)
            window.ipcRenderer.removeListener("start-all", startAll)
            window.ipcRenderer.removeListener("clear-all", clearAll)
            window.ipcRenderer.removeListener("update-color", forceUpdate)
            window.removeEventListener("mousemove", checkMouseStop)
        }
    }, [])

    useEffect(() => {
        updateProgressColor()
        updateBackgroundColor()
    })

    useEffect(() => {
        if (!started && startSignal) startConversion(true)
        if ((!started || output) && clearSignal) closeConversion()
    }, [started, startSignal, output, clearSignal])

    const startConversion = (startAll?: boolean) => {
        if (started) return
        setStartSignal(false)
        let fps = props.framerate! * fpsMultiplier
        const quality = props.type === "gif" ? gifQuality : videoQuality
        window.ipcRenderer.invoke("upscale", {id: props.id, source: props.source, dest: directory, type: props.type, framerate: fps, pitch, scale, noise, 
        mode, fpsMultiplier, speed, reverse, quality, rename, pngCompression, jpgQuality, parallelFrames, threads, upscaler, compress, gifTransparency, 
        sdColorSpace, pngFrames, pdfDownscale, pythonDownscale}, startAll)
        setLockedStats({framerate: fps, noise, scale, mode, speed, reverse})
        if (!startAll) {
            setStarted(true)
            props.setStart(props.id)
        }
    }

    const closeConversion = () => {
        window.ipcRenderer.invoke("move-queue", props.id)
        if (!output) window.ipcRenderer.invoke("delete-conversion", props.id)
        props.remove(props.id)
    }

    const deleteConversion = async () => {
        if (deleted) return
        const success = await window.ipcRenderer.invoke("delete-conversion", props.id, true)
        if (success) {
            window.ipcRenderer.invoke("move-queue")
            setDeleted(true)
        }
    }

    const stopConversion = async () => {
        if (stopped) return
        if (output || progress >= 99) return
        const success = await window.ipcRenderer.invoke("stop-conversion", props.id)
        if (success) {
            window.ipcRenderer.invoke("move-queue")
            setStopped(true)
        }
    }

    const updateBackgroundColor = async () => {
        const container = fileContainerRef.current?.querySelector(".file-container") as HTMLElement
        if (!container) return
        const theme = await window.ipcRenderer.invoke("get-theme")
        
        const colors = theme === "light" ?
            ["#87c9ff", "#91b0ff", "#949dff", "#c4d8ff", "#82bfff", "#78a2ff"] :
            ["#131f3a", "#13183a", "#13213a", "#131e36", "#121733", "#12112e"]

        if (!colors.includes(backgroundColor)) {
            const color = colors[Math.floor(Math.random() * colors.length)]
            setBackgroundColor(color)
        }
        container.style.backgroundColor = backgroundColor
        container.style.border = `4px solid ${pSBC(0.1, backgroundColor)}`
    }

    const updateProgressColor = () => {
        const colors = ["#4684f8", "#2b59ff", "#8e2bff", "#592bff", "#2baeff", "#2b6bff", "#2bf4ff", "#2ba7ff"]
        const progressBar = progressBarRef.current?.querySelector(".progress-bar") as HTMLElement
        if (started && !progressLock) {
            setProgressColor(colors[Math.floor(Math.random() * colors.length)])
            setProgressLock(true)
        }
        if (output) setProgressColor("#2bffb5")
        if (stopped) setProgressColor("#ff2495")
        if (deleted) setProgressColor("#5b3bff")
        progressBar.style.backgroundColor = progressColor
    }

    const generateProgressBar = () => {
        let jsx = <p className="file-text-progress black">Waiting...</p>
        let progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        if (started) {
            jsx = <p className="file-text-progress black">{props.type !== "image" ? "Processing..." : "Upscaling..."}</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        if (progress !== null) {
            jsx = <p className="file-text-progress">Upscaling... {progress.toFixed(2)}%</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={progress}/>
        }
        if (interlopProgress !== null) {
            jsx = <p className="file-text-progress">Interpolating... {interlopProgress.toFixed(2)}%</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={interlopProgress}/>
        }
        if (fpsMultiplier !== 1 && props.type === "video") {
            if (interlopProgress === 100) {
                jsx = <p className="file-text-progress black">Finalizing...</p>
                progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
            }
        } else {
            if (progress === 100) {
                jsx = <p className="file-text-progress black">Finalizing...</p>
                progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
            }
        }
        if (output) {
            jsx = <p className="file-text-progress black">Finished</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        if (stopped) {
            jsx = <p className="file-text-progress black">Stopped</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        if (deleted) {
            jsx = <p className="file-text-progress black">Deleted</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        return (
            <>
            <div className="file-text-progress-container">{jsx}</div>
            {progressJSX}
            </>
        )
    }

    const mouseEnter = () => {
        document.documentElement.style.setProperty("--selection-color", pSBC(0.5, backgroundColor))
    }

    const mouseLeave = () => {
        setHover(false)
        document.documentElement.style.setProperty("--selection-color", "#b5d7ff")
    }

    const preview = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const source = getSource()
        if (event.ctrlKey) return window.ipcRenderer.invoke("add-file", source, props.id)
        if (event.type === "contextmenu" && !drag) {
            if (frame) return window.ipcRenderer.invoke("preview", frame, "image")
            window.ipcRenderer.invoke("preview", source, props.type)
        }
    }

    const toggleNew = () => {
        if (output) setShowNew((prev) => !prev)
    }

    const delayPress = (event: React.MouseEvent<HTMLElement>) => {
        setDrag(previewVisible)
        if (event.button === 2) {
            return event.stopPropagation()
        } else {
            return
        }
    }

    const openLocation = async (direct?: boolean) => {
        const location = showNew ? output : props.source
        if (direct) {
            window.shell.openPath(await window.path.normalize(location))
        } else {
            window.shell.showItemInFolder(await window.path.normalize(location))
        }
    }

    const getSource = () => {
        if (props.type === "pdf") return showNew ? outputImage : props.image
        return showNew ? output : props.source
    }

    const getThumbnail = () => {
        if (props.type === "video") {
            if (frame) return <img className="file-img" onMouseDown={delayPress} onContextMenu={preview} src={frame}/>
            return <video className="file-img" onMouseDown={delayPress} onContextMenu={preview} muted autoPlay loop><source src={getSource()}></source></video>
        } else {
            if (frame) return <img className="file-img" onMouseDown={delayPress} onContextMenu={preview} src={frame}/>
            return <img className="file-img" onMouseDown={delayPress} onContextMenu={preview} src={getSource()}/>
        }
    }

    const calcWidth = (final?: boolean) => {
        if (final) {
            if (props.type === "pdf" && pdfDownscale && Number(pdfDownscale) > 0) {
                return Math.floor(((props.width / props.height) * Number(pdfDownscale)) * (started ? lockedStats.scale : scale))
            }
            return Math.floor(props.width * (started ? lockedStats.scale : scale))
        } else {
            if (props.type === "pdf" && pdfDownscale && Number(pdfDownscale) > 0) return Math.floor((props.width / props.height) * Number(pdfDownscale))
            return props.width
        }
    }

    const calcHeight = (final?: boolean) => {
        if (final) {
            if (props.type === "pdf" && pdfDownscale && Number(pdfDownscale) > 0) {
                return Math.floor(Number(pdfDownscale) * (started ? lockedStats.scale : scale))
            }
            return Math.floor(props.height * (started ? lockedStats.scale : scale))
        } else {
            if (props.type === "pdf" && pdfDownscale && Number(pdfDownscale) > 0) return pdfDownscale
            return props.height
        }
    }

    return (
        <section ref={fileContainerRef} className="file-wrap-container" onMouseOver={() => setHover(true)} 
            onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
            <div className="file-container" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} 
                onMouseDown={() => setDrag(false)} onMouseMove={() => setDrag(true)}>
            <div className="file-img-container">
                {getThumbnail()}
            </div>
            <div className="file-middle">
                <div className="file-group-top">
                    <div className="file-name">
                        <p className="file-text bigger"><span className="hover" onMouseDown={(event: any) => event.stopPropagation()} 
                            onClick={() => openLocation(true)}>{functions.cleanTitle(functions.basename(props.source))}</span></p>
                        {showNew ? 
                        <ContractIcon className="file-expand" onMouseDown={(event: any) => event.stopPropagation()} onClick={toggleNew}/> :
                        <ExpandIcon className="file-expand" onMouseDown={(event: any) => event.stopPropagation()} onClick={toggleNew}/>}
                    </div>
                    <div className="file-info">
                            <p className="file-text" onMouseDown={(event) => event.stopPropagation()}>{calcWidth()}x{calcHeight()}</p>
                            <RightArrowIcon className="file-arrow"/>
                            <p className="file-text" onMouseDown={(event) => event.stopPropagation()}>{calcWidth(true)}x{calcHeight(true)}</p>
                    </div>
                    <div className="file-info">
                            <p className="file-text" onMouseDown={(event) => event.stopPropagation()}>
                                Noise: {started ? lockedStats.noise : noise}</p>
                            <p className="file-text margin-left" onMouseDown={(event) => event.stopPropagation()}>
                                Scale: {started ? lockedStats.scale : scale}</p>
                    </div>
                    {props.type !== "image" ?
                    <div className="file-info-col-container">
                        <div className="file-info-col">
                            <div className="file-info">
                                {props.framerate ? <p className="file-text" onMouseDown={(event) => event.stopPropagation()}>
                                    Framerate: {started ? lockedStats.framerate : props.framerate * fpsMultiplier}</p> : null}
                                <p className="file-text margin-left" onMouseDown={(event) => event.stopPropagation()}>
                                    Speed: {started ? lockedStats.speed : speed}</p>
                                <p className="file-text margin-left" onMouseDown={(event) => event.stopPropagation()}>
                                    Reverse: {started ? (lockedStats.reverse ? "yes" : "no") : (reverse ? "yes" : "no")}</p>
                            </div>
                        </div>
                        <div className="file-info-col">
                            <p className="file-text-alt" onMouseDown={(event) => event.stopPropagation()}>{frames}</p>
                        </div>
                    </div> : null}
                </div>
                <div className="file-progress">
                    {generateProgressBar()}
                </div>
            </div>
            <div className="file-buttons">
                {hover ? <CloseContainerIcon className="file-button close-container" onMouseDown={(event: any) => event.stopPropagation()}
                     onClick={closeConversion}/> : null}
                <div className="file-button-row">
                    <button className="start-button" onClick={() => {started ? stopConversion() : startConversion()}}
                        onMouseDown={(event: any) => event.stopPropagation()}>
                        {started ? "Stop" : "Start"}
                    </button>
                </div>
                <div className="file-button-row">
                    {output ? <LocationIcon className="file-button" onMouseDown={(event: any) => event.stopPropagation()} 
                        onClick={() => openLocation()} style={{color: "var(--locationButton)"}}/> : null}
                    {output ? <TrashIcon className="file-button" onMouseDown={(event: any) => event.stopPropagation()} 
                        onClick={() => deleteConversion()} style={{color: "var(--trashButton)"}}/> : null}
                </div>
            </div>
            </div>
        </section>
    )
}

export default FileContainer
