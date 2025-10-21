
import React, { useState } from "react";
import { MdOutlineFileUpload, MdOutlineKeyboardVoice, MdTitle } from "react-icons/md";
import Header from "./Header.jsx";

const Home = () => {
    const [inputType, setInputType] = useState("text");
    const [voiceText, setVoiceText] = useState(""); // to store recognized speech
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder,setMediaRecorder] = useState(null);
    const [audioChunks,setAudioChunks] = useState([]);

    const [selectedImage,setSelectedImage] = useState(null);
    const [extractedText,setExtractedText] = useState("");
    
    const handleImageChange = (e)=>{
        const file = e.target.files[0];
        if(file){
            setSelectedImage(file);
        }
    };

    const handleAnalyzeImage = async()=>{
        if(!selectedImage){
            alert("Please select an image!");
        }
        const formData = new FormData();
        formData.append("image",selectedImage);
        try{
            const response = await fetch("http://localhost:5000/api/image-text",{
                method:"POST",
                body:formData,
            });
            const data = await response.json();
            setExtractedText(data.extracted_text);
        }catch(error){
            console.error("Error extracting text ",error);
            alert("Failed to process the given image");
        }
    };

    const startRecording = async ()=>{
        try{
            const stream = await navigator.mediaDevices.getUserMedia({audio:true});
            const recorder = new MediaRecorder(stream,{mimeType:"audio/webm"});
            let chunks = [];
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            recorder.onstop = async () => {
                const blob = new Blob(chunks,{type:"audio/wav"});
                const formData = new FormData();
                formData.append("audio",blob,"recording.wav");
                try{
                    const response = await fetch("http://localhost:5000/api/voice-to-text",{
                        method:"POST",
                        body:formData,
                    });
                    const data = await response.json();
                    if(data.transcribed_text){
                        setVoiceText(data.transcribed_text);
                    }
                    else{
                        alert("Could not recognise sppech");
                    }
                    
                }catch(error){
                       console.error("Error sending audio: ",error);
                       alert("Failed to convert voice to text"); 
                }
            };
            recorder.start();
            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            setIsRecording(true);
        }catch(error){
            console.error("Microphone access denied: ",error);
            alert("Please allow microphone access");
        }
    };
    const stopRecording =()=>{
        if(MediaRecorder && mediaRecorder.state!=='inactive'){
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    return (
        <>
            
            <div className="header">
                  <header><Header/></header>
                  <hr className="line"></hr>
            </div>
            <div className="top">
                <h1>Entity Sentiment Analysis</h1>
                <p>Analyze sentiment for entities in text, images, or voice recordings</p>
            </div>

            <div className="container">
                <h5>Choose Input Method</h5>
                <p>Select how you'd like to provide content for analysis</p>
                <div className="options">
                    <div
                        className={inputType === "text" ? "option active" : "option"}
                        onClick={() => setInputType("text")}
                    >
                        <i><MdTitle size={25} /></i> Text
                    </div>
                    <div
                        className={inputType === "image" ? "option active" : "option"}
                        onClick={() => setInputType("image")}
                    >
                        <i><MdOutlineFileUpload /></i> Image
                    </div>
                    <div
                        className={inputType === "voice" ? "option active" : "option"}
                        onClick={() => setInputType("voice")}
                    >
                        <i><MdOutlineKeyboardVoice /></i> Voice
                    </div>
                </div>

                {/* Conditional rendering */}
                {inputType === "text" && (
                    <div className="input-entity">
                        <input type="text" placeholder="Enter text to analyze..." />
                        <button type="submit">Analyze Text</button>
                    </div>
                )}

                {inputType === "image" && (
                    <div className="input-entity">
                        <input type="file" accept="image/*" onChange={handleImageChange}/>
                        <button type="button" onClick={handleAnalyzeImage}>Analyze Image</button>
                        {extractedText && (
                        <div className="result">
                            <h4>Extracted Text:</h4>
                            <p>{extractedText}</p>
                        </div>
                        )}

                    </div>
                )}

                {inputType === "voice" && (
                    <div className="input-entity">
                        <button type="button" onClick={isRecording?stopRecording:startRecording}>
                            {isRecording ? "Stop Recording..." : "Start Recording"}
                        </button>
                        {voiceText && (
                            <div>
                                <h4>Recognized Text:</h4>
                                <p>{voiceText}</p>
                                <button type="submit">Analyze Voice Text</button>
                                
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;


