/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useState} from "react"
import {useUpscaleSelector, useUpscaleActions, useActionSelector, useActionActions} from "../store"
import CheckboxIcon from "../assets/svg/checkbox.svg"
import CheckboxCheckedIcon from "../assets/svg/checkbox-checked.svg"
import {Dropdown, DropdownButton} from "react-bootstrap"
import functions from "../structures/functions"
import "./styles/advancedsettings.less"

const AdvancedSettings: React.FunctionComponent = (props) => {
    const {advSettings} = useActionSelector()
    const {setAdvSettings} = useActionActions()
    const {framerate, originalFramerate, videoQuality, gifQuality, pngCompression,
        jpgQuality, parallelFrames, threads, rename, pitch, sdColorSpace, gifTransparency,
        queue, upscaler, compress, pngFrames, pdfDownscale, pythonDownscale
    } = useUpscaleSelector()
    const {setFramerate, setOriginalFramerate, setVideoQuality, setGIFQuality, setPNGCompression,
        setJPGQuality, setParallelFrames, setThreads, setRename, setPitch, setSDColorSpace,
        setNoise, setScale, setSpeed, setReverse, setMode, setGIFTransparency, setQueue,
        setUpscaler, setCompress, setFPSMultiplier, setPNGFrames, setPDFDownscale,
        setPythonDownscale
    } = useUpscaleActions()
    const [pythonModels, setPythonModels] = useState([] as string[])

    useEffect(() => {
        const showSettingsDialog = (event: any, update: any) => {
            setAdvSettings(!advSettings)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "settings") setAdvSettings(false)
        }
        window.ipcRenderer.on("show-settings-dialog", showSettingsDialog)
        window.ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        initSettings()
        return () => {
            window.ipcRenderer.removeListener("show-settings-dialog", showSettingsDialog)
            window.ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
        }
    }, [advSettings])

    const initSettings = async () => {
        const settings = await window.ipcRenderer.invoke("init-settings")
        if (settings) {
            setRename(settings.rename)
            setOriginalFramerate(settings.originalFramerate)
            setFramerate(settings.framerate)
            setVideoQuality(settings.videoQuality)
            setGIFQuality(settings.gifQuality)
            setGIFTransparency(settings.gifTransparency)
            setPNGCompression(settings.pngCompression)
            setJPGQuality(settings.jpgQuality)
            setParallelFrames(settings.parallelFrames)
            setThreads(settings.threads)
            setNoise(settings.noise)
            setScale(settings.scale)
            setSpeed(settings.speed)
            setReverse(settings.reverse)
            setMode(settings.mode)
            setFPSMultiplier(settings.fpsMultiplier)
            setPitch(settings.pitch)
            setQueue(settings.queue)
            setSDColorSpace(settings.sdColorSpace)
            setUpscaler(settings.upscaler)
            setCompress(settings.compress)
            setPNGFrames(settings.pngFrames)
            setPDFDownscale(settings.pdfDownscale)
            setPythonDownscale(settings.pythonDownscale)
        }
        const pythonModels = await window.ipcRenderer.invoke("get-python-models")
        if (pythonModels.length) setPythonModels(pythonModels)
    }

    useEffect(() => {
        window.ipcRenderer.invoke("store-settings", {framerate, pitch, rename, originalFramerate, videoQuality, gifQuality, gifTransparency, 
        pngCompression, jpgQuality, parallelFrames, threads, queue, sdColorSpace, upscaler, compress, pngFrames, pdfDownscale, pythonDownscale})
    })

    const ok = () => {
        setAdvSettings(false)
    }

    const revert = () => {
        setRename("2x")
        setOriginalFramerate(true)
        setFramerate(24)
        setVideoQuality("16")
        setGIFTransparency(false)
        setGIFQuality("10")
        setPNGCompression("3")
        setJPGQuality("95")
        setParallelFrames("2")
        setThreads("4")
        setNoise("2")
        setScale("2")
        setSpeed("1")
        setReverse(false)
        setMode("noise-scale")
        setFPSMultiplier(1)
        setPitch(false)
        setQueue("1")
        setSDColorSpace(false)
        setUpscaler("waifu2x")
        setCompress(false)
        setPNGFrames(false)
        setPDFDownscale("0")
        setPythonDownscale("0")
    }

    const changeRename = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.length > 10) return
        setRename(value)
    }

    const changeVideoQuality = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value
        if (value.includes(".")) return
        if (value.length > 2) return
        if (Number.isNaN(Number(value))) return
        if (Number(value) > 51) value = "51"
        setVideoQuality(value)
    }

    const changeVideoQualityKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewQuality = () => {
                if (Number(videoQuality) + 1 > 51) return Number(videoQuality)
                return Number(videoQuality) + 1
            }
            setVideoQuality(String(getNewQuality()))
        } else if (event.key === "ArrowDown") {
            const getNewQuality = () => {
                if (Number(videoQuality) - 1 < 0) return Number(videoQuality)
                return Number(videoQuality) - 1
            }
            setVideoQuality(String(getNewQuality()))
        }
    }

    const changeGIFQuality = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.includes(".")) return
        if (value.length > 3) return
        if (Number.isNaN(Number(value))) return
        setGIFQuality(value)
    }

    const changeGIFQualityKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewQuality = () => {
                if (Number(gifQuality) + 1 > 999) return Number(gifQuality)
                return Number(gifQuality) + 1
            }
            setGIFQuality(String(getNewQuality()))
        } else if (event.key === "ArrowDown") {
            const getNewQuality = () => {
                if (Number(gifQuality) - 1 < 0) return Number(gifQuality)
                return Number(gifQuality) - 1
            }
            setGIFQuality(String(getNewQuality()))
        }
    }

    const changePNGCompression = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value
        if (value.includes(".")) return
        if (value.length > 1) return
        if (Number.isNaN(Number(value))) return
        if (Number(value) > 9) value = "9"
        setPNGCompression(value)
    }

    const changePNGCompressionKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewCompression = () => {
                if (Number(pngCompression) + 1 > 9) return Number(pngCompression)
                return Number(pngCompression) + 1
            }
            setPNGCompression(String(getNewCompression()))
        } else if (event.key === "ArrowDown") {
            const getNewCompression = () => {
                if (Number(pngCompression) - 1 < 0) return Number(pngCompression)
                return Number(pngCompression) - 1
            }
            setPNGCompression(String(getNewCompression()))
        }
    }

    const changeJPGQuality = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value
        if (value.includes(".")) return
        if (value.length > 3) return
        if (Number.isNaN(Number(value))) return
        if (Number(value) > 101) value = "101"
        setJPGQuality(value)
    }

    const changeJPGQualityKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewQuality = () => {
                if (Number(jpgQuality) + 1 > 101) return Number(jpgQuality)
                return Number(jpgQuality) + 1
            }
            setJPGQuality(String(getNewQuality()))
        } else if (event.key === "ArrowDown") {
            const getNewQuality = () => {
                if (Number(jpgQuality) - 1 < 0) return Number(jpgQuality)
                return Number(jpgQuality) - 1
            }
            setJPGQuality(String(getNewQuality()))
        }
    }

    const changePDFDownscale = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.includes(".")) return
        if (Number.isNaN(Number(value))) return
        setPDFDownscale(value)
    }

    const changePDFDownscaleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewDownscale = () => {
                return Number(pdfDownscale) + 100
            }
            setPDFDownscale(String(getNewDownscale()))
        } else if (event.key === "ArrowDown") {
            const getNewDownscale = () => {
                if (Number(pdfDownscale) - 100 < 0) return Number(pdfDownscale)
                return Number(pdfDownscale) - 100
            }
            setPDFDownscale(String(getNewDownscale()))
        }
    }

    const changePythonDownscale = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.includes(".")) return
        if (Number.isNaN(Number(value))) return
        setPythonDownscale(value)
    }

    const changePythonDownscaleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewDownscale = () => {
                return Number(pythonDownscale) + 100
            }
            setPythonDownscale(String(getNewDownscale()))
        } else if (event.key === "ArrowDown") {
            const getNewDownscale = () => {
                if (Number(pythonDownscale) - 100 < 0) return Number(pythonDownscale)
                return Number(pythonDownscale) - 100
            }
            setPythonDownscale(String(getNewDownscale()))
        }
    }

    const changeParallelFrames = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.includes(".")) return
        if (value.length > 3) return
        if (Number.isNaN(Number(value))) return
        setParallelFrames(value)
    }

    const changeParallelFramesKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewFrames = () => {
                if (Number(parallelFrames) + 1 > 999) return Number(parallelFrames)
                return Number(parallelFrames) + 1
            }
            setParallelFrames(String(getNewFrames()))
        } else if (event.key === "ArrowDown") {
            const getNewFrames = () => {
                if (Number(parallelFrames) - 1 < 0) return Number(parallelFrames)
                return Number(parallelFrames) - 1
            }
            setParallelFrames(String(getNewFrames()))
        }
    }

    const changeThreads = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.includes(".")) return
        if (value.length > 2) return
        if (Number.isNaN(Number(value))) return
        setThreads(value)
    }

    const changeThreadsKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewThreads = () => {
                if (Number(threads) + 1 > 99) return Number(threads)
                return Number(threads) + 1
            }
            setThreads(String(getNewThreads()))
        } else if (event.key === "ArrowDown") {
            const getNewThreads = () => {
                if (Number(threads) - 1 < 0) return Number(threads)
                return Number(threads) - 1
            }
            setThreads(String(getNewThreads()))
        }
    }

    const changeQueue = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value
        if (value.includes(".")) return
        if (value.length > 3) return
        if (Number.isNaN(Number(value))) return
        setQueue(value)
        window.ipcRenderer.invoke("update-concurrency", Number(value))
    }

    const changeQueueKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        let value = queue
        if (event.key === "ArrowUp") {
            const getNewQueue = () => {
                if (Number(queue) + 1 > 999) return Number(queue)
                return Number(queue) + 1
            }
            setQueue(String(getNewQueue()))
        } else if (event.key === "ArrowDown") {
            const getNewQueue = () => {
                if (Number(queue) - 1 < 1) return Number(queue)
                return Number(queue) - 1
            }
            setQueue(String(getNewQueue()))
        }
        window.ipcRenderer.invoke("update-concurrency", Number(value))
    }

    const getUpscaler = () => {
        if (!upscaler) return "waifu2x"
        if (upscaler === "waifu2x") return "waifu2x"
        if (upscaler === "real-esrgan") return "Real-ESRGAN"
        if (upscaler === "real-cugan") return "Real-CUGAN"
        if (upscaler === "anime4k") return "Anime4K"
        return functions.basename(upscaler)
    }

    const pythonModelsJSX = () => {
        let jsx = [] as any
        for (let i = 0; i < pythonModels.length; i++) {
            let sep = window.platform === "windows" ? "\\" : "/"
            let model = pythonModels[i].split(sep).pop()?.replace(/\.[^/.]+$/, "")
            jsx.push(<Dropdown.Item active={upscaler === pythonModels[i]} onClick={() => setUpscaler(pythonModels[i])}>{model}</Dropdown.Item>)
        }
        return jsx
    }

    if (advSettings) {
        return (
            <section className="settings-dialog">
                <div className="settings-dialog-box">
                    <div className="settings-container">
                        <div className="settings-title-container">
                            <p className="settings-title">Advanced Settings</p>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Upscaler: </p>
                            <DropdownButton className="btn-filter" title={getUpscaler()} drop="down">
                                <Dropdown.Item active={upscaler === "waifu2x"} onClick={() => setUpscaler("waifu2x")}>waifu2x</Dropdown.Item>
                                <Dropdown.Item active={upscaler === "real-esrgan"} onClick={() => setUpscaler("real-esrgan")}>Real-ESRGAN</Dropdown.Item>
                                <Dropdown.Item active={upscaler === "real-cugan"} onClick={() => setUpscaler("real-cugan")}>Real-CUGAN</Dropdown.Item>
                                <Dropdown.Item active={upscaler === "anime4k"} onClick={() => setUpscaler("anime4k")}>Anime4K</Dropdown.Item>
                                {pythonModelsJSX()}
                            </DropdownButton>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Rename: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={rename} onChange={changeRename}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Pitch Audio? </p>
                            {pitch ? 
                            <CheckboxCheckedIcon className="settings-checkbox" onClick={() => setPitch(!pitch)}/> :
                            <CheckboxIcon className="settings-checkbox" onClick={() => setPitch(!pitch)}/>}
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">SD Colorspace? </p>
                            {sdColorSpace ? 
                            <CheckboxCheckedIcon className="settings-checkbox" onClick={() => setSDColorSpace(!sdColorSpace)}/> :
                            <CheckboxIcon className="settings-checkbox" onClick={() => setSDColorSpace(!sdColorSpace)}/>}
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Video Quality: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={videoQuality} onChange={changeVideoQuality} onKeyDown={changeVideoQualityKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">GIF Transparency? </p>
                            {gifTransparency ? 
                            <CheckboxCheckedIcon className="settings-checkbox" onClick={() => setGIFTransparency(!gifTransparency)}/> :
                            <CheckboxIcon className="settings-checkbox" onClick={() => setGIFTransparency(!gifTransparency)}/>}
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">GIF Quality: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={gifQuality} onChange={changeGIFQuality} onKeyDown={changeGIFQualityKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">PNG Compression: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={pngCompression} onChange={changePNGCompression} onKeyDown={changePNGCompressionKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">JPG/WEBP/AVIF Quality: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={jpgQuality} onChange={changeJPGQuality} onKeyDown={changeJPGQualityKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Compress to JPG? </p>
                            {compress ? 
                            <CheckboxCheckedIcon className="settings-checkbox" onClick={() => setCompress(!compress)}/> :
                            <CheckboxIcon className="settings-checkbox" onClick={() => setCompress(!compress)}/>}
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">PNG Frames? </p>
                            {pngFrames ? 
                            <CheckboxCheckedIcon className="settings-checkbox" onClick={() => setPNGFrames(!pngFrames)}/> :
                            <CheckboxIcon className="settings-checkbox" onClick={() => setPNGFrames(!pngFrames)}/>}
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">PDF Downscale: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={pdfDownscale} onChange={changePDFDownscale} onKeyDown={changePDFDownscaleKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Python Downscale: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={pythonDownscale} onChange={changePythonDownscale} onKeyDown={changePythonDownscaleKey}/>
                        </div>
                        <div className="settings-row">
                                <p className="settings-text">Concurrent Upscales: </p>
                                <input className="settings-input" type="text" spellCheck="false" value={queue} onChange={changeQueue} onKeyDown={changeQueueKey}/>
                            </div>
                        <div className="settings-row">
                            <p className="settings-text">Parallel Frames: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={parallelFrames} onChange={changeParallelFrames} onKeyDown={changeParallelFramesKey}/>
                        </div>
                        <div className="settings-row">
                            <p className="settings-text">Threads: </p>
                            <input className="settings-input" type="text" spellCheck="false" value={threads} onChange={changeThreads} onKeyDown={changeThreadsKey}/>
                        </div>
                        <div className="settings-button-container">
                         <button onClick={revert} className="revert-button">Revert</button>
                            <button onClick={ok} className="ok-button">Ok</button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
    return null
}

export default AdvancedSettings
