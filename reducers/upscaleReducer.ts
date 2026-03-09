/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Waifu2x Upscaler - A cute image upscaler ❤                *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import {createSlice} from "@reduxjs/toolkit"
import {useSelector, useDispatch} from "react-redux"
import type {StoreState, StoreDispatch} from "../store"

const upscaleSlice = createSlice({
    name: "upscale",
    initialState: {
        directory: "",
        noise: "2",
        scale: "2",
        mode: "noise-scale",
        fpsMultiplier: 1,
        speed: "1",
        reverse: false,
        originalFramerate: true,
        framerate: 24,
        videoQuality: "16",
        gifQuality: "10",
        pngCompression: "3",
        jpgQuality: "95",
        parallelFrames: "2",
        threads: "4",
        rename: "2x",
        gifTransparency: false,
        pitch: false,
        sdColorSpace: false,
        queue: "1",
        upscaler: "waifu2x",
        compress: false,
        pngFrames: false,
        pdfDownscale: "0",
        pythonDownscale: "0"
    },
    reducers: {
        setDirectory: (state, action) => {state.directory = action.payload},
        setNoise: (state, action) => {state.noise = action.payload},
        setScale: (state, action) => {state.scale = action.payload},
        setMode: (state, action) => {state.mode = action.payload},
        setFPSMultiplier: (state, action) => {state.fpsMultiplier = action.payload},
        setSpeed: (state, action) => {state.speed = action.payload},
        setReverse: (state, action) => {state.reverse = action.payload},
        setOriginalFramerate: (state, action) => {state.originalFramerate = action.payload},
        setFramerate: (state, action) => {state.framerate = action.payload},
        setVideoQuality: (state, action) => {state.videoQuality = action.payload},
        setGIFQuality: (state, action) => {state.gifQuality = action.payload},
        setPNGCompression: (state, action) => {state.pngCompression = action.payload},
        setJPGQuality: (state, action) => {state.jpgQuality = action.payload},
        setParallelFrames: (state, action) => {state.parallelFrames = action.payload},
        setThreads: (state, action) => {state.threads = action.payload},
        setRename: (state, action) => {state.rename = action.payload},
        setGIFTransparency: (state, action) => {state.gifTransparency = action.payload},
        setPitch: (state, action) => {state.pitch = action.payload},
        setSDColorSpace: (state, action) => {state.sdColorSpace = action.payload},
        setQueue: (state, action) => {state.queue = action.payload},
        setUpscaler: (state, action) => {state.upscaler = action.payload},
        setCompress: (state, action) => {state.compress = action.payload},
        setPNGFrames: (state, action) => {state.pngFrames = action.payload},
        setPDFDownscale: (state, action) => {state.pdfDownscale = action.payload},
        setPythonDownscale: (state, action) => {state.pythonDownscale = action.payload},
    }    
})

const {
    setDirectory, setNoise, setScale, setMode, setFPSMultiplier, setSpeed, setReverse,
    setOriginalFramerate, setFramerate, setVideoQuality, setGIFQuality, setPNGCompression,
    setJPGQuality, setParallelFrames, setThreads, setRename, setGIFTransparency, setPitch,
    setSDColorSpace, setQueue, setUpscaler, setCompress, setPNGFrames, setPDFDownscale,
    setPythonDownscale
} = upscaleSlice.actions

export const useUpscaleSelector = () => {
    const selector = useSelector.withTypes<StoreState>()
    return {
        directory: selector((state) => state.upscale.directory),
        noise: selector((state) => state.upscale.noise),
        scale: selector((state) => state.upscale.scale),
        mode: selector((state) => state.upscale.mode),
        fpsMultiplier: selector((state) => state.upscale.fpsMultiplier),
        speed: selector((state) => state.upscale.speed),
        reverse: selector((state) => state.upscale.reverse),
        originalFramerate: selector((state) => state.upscale.originalFramerate),
        framerate: selector((state) => state.upscale.framerate),
        videoQuality: selector((state) => state.upscale.videoQuality),
        gifQuality: selector((state) => state.upscale.gifQuality),
        pngCompression: selector((state) => state.upscale.pngCompression),
        jpgQuality: selector((state) => state.upscale.jpgQuality),
        parallelFrames: selector((state) => state.upscale.parallelFrames),
        threads: selector((state) => state.upscale.threads),
        rename: selector((state) => state.upscale.rename),
        gifTransparency: selector((state) => state.upscale.gifTransparency),
        pitch: selector((state) => state.upscale.pitch),
        sdColorSpace: selector((state) => state.upscale.sdColorSpace),
        queue: selector((state) => state.upscale.queue),
        upscaler: selector((state) => state.upscale.upscaler),
        compress: selector((state) => state.upscale.compress),
        pngFrames: selector((state) => state.upscale.pngFrames),
        pdfDownscale: selector((state) => state.upscale.pdfDownscale),
        pythonDownscale: selector((state) => state.upscale.pythonDownscale)
    }
}

export const useUpscaleActions = () => {
    const dispatch = useDispatch.withTypes<StoreDispatch>()()
    return {
        setDirectory: (state: string) => dispatch(setDirectory(state)),
        setNoise: (state: string) => dispatch(setNoise(state)),
        setScale: (state: string) => dispatch(setScale(state)),
        setMode: (state: string) => dispatch(setMode(state)),
        setFPSMultiplier: (state: number) => dispatch(setFPSMultiplier(state)),
        setSpeed: (state: string) => dispatch(setSpeed(state)),
        setReverse: (state: boolean) => dispatch(setReverse(state)),
        setOriginalFramerate: (state: boolean) => dispatch(setOriginalFramerate(state)),
        setFramerate: (state: number) => dispatch(setFramerate(state)),
        setVideoQuality: (state: string) => dispatch(setVideoQuality(state)),
        setGIFQuality: (state: string) => dispatch(setGIFQuality(state)),
        setPNGCompression: (state: string) => dispatch(setPNGCompression(state)),
        setJPGQuality: (state: string) => dispatch(setJPGQuality(state)),
        setParallelFrames: (state: string) => dispatch(setParallelFrames(state)),
        setThreads: (state: string) => dispatch(setThreads(state)),
        setRename: (state: string) => dispatch(setRename(state)),
        setGIFTransparency: (state: boolean) => dispatch(setGIFTransparency(state)),
        setPitch: (state: boolean) => dispatch(setPitch(state)),
        setSDColorSpace: (state: boolean) => dispatch(setSDColorSpace(state)),
        setQueue: (state: string) => dispatch(setQueue(state)),
        setUpscaler: (state: string) => dispatch(setUpscaler(state)),
        setCompress: (state: boolean) => dispatch(setCompress(state)),
        setPNGFrames: (state: boolean) => dispatch(setPNGFrames(state)),
        setPDFDownscale: (state: string) => dispatch(setPDFDownscale(state)),
        setPythonDownscale: (state: string) => dispatch(setPythonDownscale(state))
    }
}

export default upscaleSlice.reducer