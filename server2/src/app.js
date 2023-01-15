import { Container, Row, Col} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import React from "react";
import * as faceapi from "face-api.js";
import axios from 'axios';

export default function App() {
    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    React.useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + "/models";

            Promise.all([
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            ]).then(setModelsLoaded(true));
        };
        loadModels();
    }, []);

    const [showImg, toggleImgDisplay] = React.useState(false);
    const [showFileLoader, toggleFileLoader] = React.useState(true);
    const [isLoading, checkLoad] = React.useState(false);
    const [imgSrc, getImg] = React.useState("");
    const [check, canCheck] = React.useState(false);
    const [numFaces, getNumFaces] = React.useState(0);
    const [checked, isChecked] = React.useState(false);
    const [match, setMatch] = React.useState("");
    const [face, setFace] = React.useState("");
    
    const canvasRef = React.useRef();
    const contRef = React.useRef();
    const imgRef = React.useRef();

    const messages = [
        "Sorry, face not detected. Please try another image",
        "Face detected!",
        "Sorry, your image has too many faces. Please try another image",
    ];

    function displayImg(props) {
        toggleFileLoader(false);
        checkLoad(true);
        const file = props.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            getImg(reader.result);
        };
        if (modelsLoaded) {
            getFace(file).then((result) => {
                checkNumFaces(result[0], result[1]);
                toggleImgDisplay(true);
                checkLoad(false);
            });
        }
    }

    async function getFace(file) {
        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi
            .detectAllFaces(img)
        return [detections, img];
    }

    async function getBox(detections, imgFile) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(imgFile);
        const container = contRef.current;
        const displaySize = { width: container.clientWidth, height: container.clientHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvasRef.current.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        const regionsToExtract = [
            new faceapi.Rect(detections[0].box.x, detections[0].box.y, detections[0].box.width, detections[0].box.height)
          ];
        let faceImages = await faceapi.extractFaces(imgRef.current, regionsToExtract);
        setFace(faceImages[0].toDataURL().replace("data:image/png;base64,", ""));
    }

    function checkNumFaces(faces, imgFile) {
        if (faces.length === 1) {
            getNumFaces(1);
            canCheck(true);
            getBox(faces, imgFile);
        } else if (faces.length > 1) {
            getNumFaces(2);
        } else {
            getNumFaces(0);
        }
    }

    function removeImg() {
        toggleImgDisplay(false);
        toggleFileLoader(true);
        const form = document.getElementById("fileform");
        form.reset();
        canCheck(false);
        isChecked(false);
        setMatch("");
    }

    function checkImg() {
        isChecked(true);
        canCheck(false);
        reverseSearch();   
    }

    function reverseSearch() {
        const formdata = new FormData();
        formdata.append("image", face);
        let config = {
            headers: {
                Authorization: "Client-ID 1e5dec5f6acb0a9"
            }
        }
        axios.post("https://api.imgur.com/3/image/", formdata, config).then((response) => {
            axios.post('/api', {image: response.data.data.link}).then((res) => {
                setMatch(res.data);
            })
        })
    }

    return (
        <main>
            <h1 className="text-center text-warning mb-5 pt-3" id="title">
                FACE FINDER
            </h1>
            <Container
                fluid
                className="text-center border border-warning h-50 w-25 align-items-center d-flex justify-content-center p-0"
                id="imgUploadBox"
                ref={contRef}
            >
                <img
                    src={imgSrc}
                    alt="Image that you have selected"
                    className={`scaled ${showImg ? "d-block" : "d-none"}`}
                    id="uploadedImage"
                    ref={imgRef}
                />
                <canvas ref={canvasRef} className="position-absolute d-none"></canvas>
                <form id="fileform">
                    <input
                        onChange={displayImg}
                        className={`form-control ${
                            showFileLoader ? "d-block" : "d-none"
                        }`}
                        accept="image/png, image/jpg, image/jpeg"
                        type="file"
                        id="formFile"
                    />
                </form>
                <div
                    className={`spinner-border ${
                        isLoading ? "d-block" : "d-none"
                    } text-warning`}
                    role="status"
                ></div>
            </Container>

            <Container
                fluid
                className="d-flex justify-content-center w-50 mt-3"
            >
                <Row>
                    <Col className="d-flex justify-content-center col-lg-6 col-md-12">
                        <button
                            onClick={removeImg}
                            disabled={!showImg || (checked && match.length === 0) }
                            className="btn btn-lg btn-primary text-nowrap mb-3"
                        >
                            Remove Img
                        </button>
                    </Col>
                    <Col className="d-flex justify-content-center col-lg-6 col-md-12">
                        <button
                            onClick={checkImg}
                            disabled={!check}
                            className="btn btn-lg btn-success text-nowrap mb-3"
                        >
                            Check Img
                        </button>
                    </Col>
                </Row>
            </Container>

            <h2
                className='text-center mt-4 text-warning'
            >
                {showImg && !checked
                    ? messages[numFaces]
                    : showImg && checked && match.length > 0
                    ? `This person is ${match}`
                    : showImg && checked
                    ? "Getting name"
                    : ""}
            </h2>
        </main>
    );
}