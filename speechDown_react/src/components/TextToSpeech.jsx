import { useState } from "react";
import axios from "axios";

function TextToSpeech() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tts/hablar",
        { texto: text },
        {
          responseType: "blob",
        }
      );
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generando audio:", error);
    }
  };

  return (
    <div>
      <h3>Texto a Voz</h3>
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Escribe algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-2">
          Escuchar
        </button>
      </form>
      {audioUrl && <audio controls src={audioUrl} />}
    </div>
  );
}

export default TextToSpeech;
