<template>
    <div class="container">
        <div class="screen">
            <div class="title-content">
                <h1 class="main-title">
                    决斗会社
                </h1>
                <h1 class="main-title main-title2">
                    决斗会社
                </h1>
            </div>
            
            <canvas id="noise" class="noise"></canvas>
            <div class="vignette"></div>
            <div class="line"></div>
        </div>
        <div class="login-container">
            <!-- 表单 -->
        </div>
    </div>
</template>

<script>
import Velocity from 'velocity-animate';

export default {
    name: "Login",
    mounted() {
        const canvas = document.getElementById('noise');
        const ctx = canvas.getContext('2d');

        let container = document.querySelector(".screen");
        const wWidth = container.clientWidth;
        const wHeight = container.clientHeight;

        canvas.width = wWidth;
        canvas.height = wHeight;

        const noiseData = [];
        let frame = 0;

        for (let i = 0; i < 10; i++) {
            let idata = ctx.createImageData(wWidth, wHeight);
            let buffer32 = new Uint32Array(idata.data.buffer);
            let len = buffer32.length;

            for (let j = 0; j < len; j++) {
                if (Math.random() < 0.5) {
                    buffer32[j] = 0xff000000;
                }
            }

            noiseData.push(idata);
        }

        const painNoise = () => {
            if (frame === 9) {
                frame = 0;
            } else {
                frame++;
            }

            ctx.putImageData(noiseData[frame], 0, 0)
        }

        const loop = () => {
            painNoise(frame);

            window.requestAnimationFrame(loop);
        };

        loop();

        let originTitle = document.querySelector('.title-content');
        let title = document.querySelector('.main-title2');
        let shake = 3;
        function animateTitle() {
            let animateChaning;

            for (let i = 50; i--;) {
                if (!animateChaning) {
                    animateChaning = Velocity(title, {
                        opacity: R(0, 1), 
                        top: R(-shake, shake), 
                        left: originTitle.clientWidth* 0.5 + R(-shake, shake)}, 
                        {duration: R(30, 170)});
                } else {
                    animateChaning = animateChaning.then(() => {
                        return Velocity(
                            title, {
                                opacity: R(0, 1), 
                                top: R(-shake, shake), 
                                left: originTitle.clientWidth * 0.5 + R(-shake, shake)}, {duration: R(30, 170)});
                    })
                }
            }

            animateChaning.then(() => {
                animateTitle();
            })
        }

        animateTitle();

        let line = document.querySelector(".line");
        function animateLine() {
            Velocity(line, {
                opacity: [R(0.1, 1), R(0.1, 1)],
                left: [R(-window.innerWidth / 2, window.innerWidth / 2), R(-window.innerWidth / 2, window.innerWidth / 2)]
            }, {
                duration: R(200, 500)
            }).then(() => {
                animateLine();
            })
        }

        animateLine();

        function R(max, min) {return Math.random() * (max - min) + min}
    }
}
</script>

<style>
  @import '../assets/styles/Login.css';
</style>