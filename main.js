const video = document.getElementById('detectVideo');
startVideo = async () => {
    let stream = null;
    try {
        const constraints = {
            audio: false,
            video: {
                width: { min: 1024, ideal: 1280, max: 1920 },
                height: { min: 576, ideal: 720, max: 1080 },
                facingMode: 'user'
            }
        }
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
    }
    catch (err) {
        console.log('error from media', err);
    }
}

loadModal = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
    await faceapi.nets.faceExpressionNet.loadFromUri('./models');
    startVideo();
}
loadModal();

detectFaces = async (canvas, displaySize) => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
    const displayDetections = faceapi.resizeResults(detections, displaySize);
    console.log(displayDetections);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    // const box = { x: displayDetections[0].detection.box.x, y: displayDetections[0].detection.box.y, width: displayDetections[0].detection.box.width, height: displayDetections[0].detection.box.height };
    
    // const drawOptions = {
    //     label: 'no mask',
    //     lineWidth: 2,
    //     boxColor: 'red'
    // }
    // const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
    // drawBox.draw(canvas);
    faceapi.draw.drawDetections(canvas, displayDetections);
    // faceapi.draw.drawFaceExpressions(canvas, displayDetections, 0.05);
}

video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(() => {
        detectFaces(canvas, displaySize);
    }, 100)
})