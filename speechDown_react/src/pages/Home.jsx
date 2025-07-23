import TextToSpeech from "../components/TextToSpeech";

function Home() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1>Bienvenido a SpeechDown</h1>
      <TextToSpeech />

    </div>
  );
}

export default Home;
