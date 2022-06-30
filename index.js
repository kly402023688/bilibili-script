// ==UserScript==
// @name         Kiva自用b站视频脚本
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  自用
// @author       Kiva
// @match        *://*.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?domain=bilibili.com
// @updateURL    https://github.com/kly402023688/bilibili-script/blob/master/index.js
// @downloadURL  https://github.com/kly402023688/bilibili-script/blob/master/index.js
// @homepage     https://github.com/kly402023688/bilibili-script
// @grant        none
// ==/UserScript==
(function() {
  'use strict';
  // 点击一次跳的帧数
  const JUMP_FRAME = 0.016 * 5
  // 轮询时间间隔
  const INTERVAL_TIME = 100

  // 截图
  const snapshot = () => {
    const tagName = document.querySelector('bwp-video') ? 'bwp-video' : 'video'
    const download = (src, filename) => {
      const link = document.createElement('a');
      link.download = filename;
      link.style.display = 'none';
      link.href = src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const genVideoDataUrl = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const video = document.querySelector('video')
      const style = window.getComputedStyle(video)
      canvas.width = parseInt(style.width)
      canvas.height = parseInt(style.height)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL()
    }

    const genBwpVideoDataUrl = () => {
      const video = document.querySelector('bwp-video')
      return video.toDataURL()
    }

    const genTime = time => {
      time = Math.floor(time)
      const minutes = Math.floor(time / 60)
      const hour = Math.floor(minutes / 60)
      return hour ? `${hour}小时${minutes - hour * 60}分${time - minutes * 60}秒` : `${minutes}分${time - minutes * 60}秒`
    }

    const genDataUrl = () => {
      if (tagName === 'bwp-video') return genBwpVideoDataUrl()
      return genVideoDataUrl()
    }

    const genTitle = () => `${document.title}${genTime(document.querySelector(tagName).currentTime)}.jpeg`
    download(genDataUrl(), genTitle())
  }

  // 逐帧跳转
  const changeFrame = (dif) => {
    const videoGo = (tagName) => {
      const video = document.querySelector(tagName)
      const currentTime = video.currentTime
      video.currentTime = currentTime + dif
    }
    if (document.querySelector('bwp-video')) return videoGo('bwp-video')
    return videoGo('video')
  }
  const addFrame = () => {
    changeFrame(JUMP_FRAME)
  }
  const subFrame = () => {
    changeFrame(-JUMP_FRAME)
  }

  // 判断视频类型
  const judgeControlWrapLoaded = () => {
    const video = document.querySelector('bwp-video') || document.querySelector('video')
    if (!video || video.readyState !== 4) return null
    const controlWrap = document.querySelector(".squirtle-controller-wrap");
    return !!controlWrap
  }

  // 生成图标
  const genControlIcon = (svg, method) => {
    const div = document.createElement('div')
    div.setAttribute('style', 'display: flex;margin: 0 6px;cursor: pointer;color: #fff;')
    div.innerHTML = svg
    div.addEventListener('click', method)
    return div
  }

  // 宽屏模式
  const initWidescreen = function () {
    setTimeout(() => {
      const is = judgeControlWrapLoaded()
      if (is == null) return initWidescreen();
      const clazz = is ? '.squirtle-widescreen-inactive' : '.bilibili-player-video-btn-widescreen'
      const dom = document.querySelector(clazz)
      if (!dom) return initWidescreen();
      dom.click()
      setTimeout(() => {
        const anime = document.getElementById('bilibiliPlayer');
        const movie = document.getElementById('bilibili-player') && document.getElementById('bilibili-player').querySelector('.bpx-player-container');
        if (anime && !anime.classList.contains('mode-widescreen')) return initWidescreen();
        if (movie && movie.dataset.screen === 'normal') return initWidescreen();
      }, INTERVAL_TIME);
    }, INTERVAL_TIME);
  }

  // 截图
  const initSnapshot = function () {
    const timer = setInterval(() => {
      const is = judgeControlWrapLoaded()
      if (is == null) return
      const clazz = is ? '.squirtle-controller-wrap-left' : '.bilibili-player-video-control-bottom-left'
      const leftWrap = document.querySelector(clazz)
      if (!leftWrap || !leftWrap.childElementCount) return
      clearInterval(timer)
      leftWrap.appendChild(genControlIcon(`<svg class="icon" viewBox="0 0 1024 1024" width="200" height="200" fill ="currentColor" style="width: 20px; height: 20px;"><path d="M880.672 899.013H143.33c-42.866 0-77.617-34.654-77.617-77.403V299.141c0-42.75 34.75-77.403 77.617-77.403h164.933l48.507-77.402c0-10.69 28.093-19.351 38.809-19.351h232.845c10.714 0 38.807 8.662 38.807 19.351l48.51 77.402H880.673c42.866 0 77.614 34.653 77.614 77.403v522.47c0 42.748-34.748 77.402-77.614 77.402z m-368.67-599.872c-139.313 0-252.25 112.627-252.25 251.56 0 138.935 112.937 251.559 252.25 251.559 139.308 0 252.241-112.621 252.247-251.546v-0.023c-0.006-138.929-112.939-251.55-252.247-251.55z m0 425.717c-96.448 0-174.634-77.969-174.634-174.156 0-96.183 78.186-174.157 174.634-174.157s174.632 77.974 174.632 174.157c0 96.187-78.185 174.156-174.632 174.156z"></path></svg>`, snapshot))
    }, INTERVAL_TIME)
  }

  // 跳帧
  const initFrame = function () {
    const timer = setInterval(() => {
      const is = judgeControlWrapLoaded()
      if (is == null) return
      const clazz = is ? '.squirtle-controller-wrap-left' : '.bilibili-player-video-control-bottom-left'
      const leftWrap = document.querySelector(clazz)
      if (!leftWrap || !leftWrap.childElementCount) return
      clearInterval(timer)
      leftWrap.appendChild(genControlIcon(`<svg viewBox="0 0 1024 1024" width="200" height="200" fill ="currentColor" style="width: 16px; height: 16px;margin-top: 2px;"><path d="M778.965749 128.759549l-383.064442 383.063419 388.097062 388.096039-0.070608 0.033769c12.709463 13.137205 20.529569 31.024597 20.529569 50.731428 0 40.376593-32.736589 73.112158-73.115228 73.112158-19.705807 0-37.591153-7.819083-50.730405-20.528546l-0.034792 0.035816L241.890654 564.622498l0.035816-0.035816c-13.779841-13.281491-22.3838-31.915897-22.3838-52.585659 0-0.071631 0-0.106424 0-0.178055 0-0.072655 0-0.10847 0-0.144286 0-20.669762 8.603959-39.341007 22.3838-52.622498l-0.035816-0.034792L680.573835 20.337187l0.180102 0.179079c13.139252-12.5662 30.950919-20.313651 50.587142-20.313651 40.378639 0 73.115228 32.736589 73.115228 73.114205C804.455283 95.485725 794.567076 115.334795 778.965749 128.759549z"></path></svg>`, subFrame))
      leftWrap.appendChild(genControlIcon(`<svg viewBox="0 0 1024 1024" width="200" height="200" fill ="currentColor" style="width: 16px; height: 16px;margin-top: 2px;"><path d="M245.034251 895.239428l383.063419-383.063419L240.001631 124.07997l0.070608-0.033769c-12.709463-13.137205-20.530592-31.024597-20.530592-50.731428 0-40.376593 32.736589-73.111135 73.115228-73.111135 19.705807 0 37.591153 7.819083 50.730405 20.528546l0.034792-0.035816 438.686251 438.681134-0.035816 0.034792c13.779841 13.281491 22.3838 31.915897 22.3838 52.586682 0 0.071631 0 0.106424 0 0.178055 0 0.072655 0 0.10847 0 0.144286 0 20.669762-8.603959 39.341007-22.3838 52.623521l0.035816 0.033769L343.426165 1003.661789l-0.180102-0.179079c-13.140275 12.565177-30.950919 20.313651-50.588165 20.313651-40.378639 0-73.115228-32.736589-73.115228-73.114205C219.544717 928.512229 229.432924 908.664182 245.034251 895.239428z"></path></svg>`, addFrame))
    }, INTERVAL_TIME)
  }

 initWidescreen();
 const pushState = window.history.pushState;
 // 监听路由变化进入宽屏模式
 window.history.pushState = function() {
     pushState.apply(this, arguments);
     setTimeout(() => { initWidescreen(); }, 100);
 }
 window.addEventListener('hashchange', () => {
     setTimeout(() => { initWidescreen(); }, 100);
 });
 // initSnapshot()
 // initFrame()
})();
