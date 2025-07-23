import { useState } from "react";
import axios from "axios";

function TextToSpeech({ content }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (!content) return; // si no hay contenido, no hacemos nada
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tts/hablar",
        { texto: content },
        {
          responseType: "blob",
        }
      );
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generando audio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-3">
      <button
        onClick={handlePlay}
        className="btn btn-primary"
        disabled={loading || !content}
      >
        {loading ? "Generando audio..." : "Escuchar actividad"}
      </button>
      {audioUrl && (
        <div className="mt-3">
          <audio controls src={audioUrl} autoPlay />
        </div>
      )}
    </div>
  );
}

export default TextToSpeech;
