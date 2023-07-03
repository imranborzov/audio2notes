function setApiKey() {
  var apiKey = document.getElementById("apiKeyInput").value;
  localStorage.setItem("apiKey", apiKey);
  alert("API Key set successfully!");
}

document.getElementById("uploadButton").addEventListener("click", function() {
  document.getElementById("fileInput").click();
});

document.getElementById("learnMoreButton").addEventListener("click", function() {
  document.getElementById("convertSection").scrollIntoView({ behavior: 'smooth' });
});

document.getElementById("copyButton").addEventListener("click", function() {
  var outputText = document.getElementById("outputBox").innerText;
  copyToClipboard(outputText);
  alert("Text copied to clipboard!");
});

function copyToClipboard(text) {
  var textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

document.getElementById("fileInput").addEventListener("change", function() {
  var file = this.files[0];
  var outputBox = document.getElementById("outputBox");
  outputBox.innerHTML = `
    <div id="loadingAnimation" class="loading-animation">
      <i class="fas fa-spinner fa-spin"></i>
      <span></span>
    </div>
  `;

  var audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/m4a', 'audio/webm', 'audio/mp4', 'audio/mpga', 'audio/x-m4a'];
  if (audioTypes.indexOf(file.type) === -1) {
    alert("Please select an audio file (MP3, WAV, M4A, WEBM, MP4, MPGA).");
    this.value = '';
    outputBox.innerHTML = "Invalid audio format";
    return;
  }

  var formData = new FormData();
  formData.append("model", "whisper-1");
  formData.append("file", file);

  fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("apiKey")
    },
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.text && data.text.length > 0) {
        var transcription = data.text;

        const prompt = `
          Write a Title for the transcript that is under 15 words.
          Then write: "-Summary-"
          Write "Summary" as a Heading 1. (DO NOT USE <h1>, <h2>, etc. TAGS, ONLY USE <strong> and <br>)
          Write a summary of the provided transcript.
          Then write: "-Additional Info-". (DO NOT USE <h1>, <h2> etc. TAGS, ONLY USE <strong> and <br>)
          Then return a list of the main points in the provided transcript. Then return a list of action items.
          Then return a list of follow up questions. Then return a list of potential arguments against the transcript.
          For each list, return a Heading 2 (DO NOT USE <h1>, <h2>, etc. TAGS, ONLY USE <strong> and <br>) before writing the list items. Limit each list item to 100 words.
          Here is an example of how the response should look like:
          "
          <strong>Working Efficiently and Innovative Solutions in Difficult Situations</strong>
          <br><br>
          <strong>Summary</strong>
          <br>
          text
          <br><br>
          <strong>Additional Info</strong>
          <br>
          <strong>Main Points:</strong>
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          text
          <br>
          <strong>Potential Arguments Against the Transcript:</strong>
          <br>
          text
          <br>
          text
          <br>
          text
          "
          Transcript:
          ${transcription}`;

        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("apiKey")
          },
          body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{
              "role": "user",
              "content": prompt
            }]
          })
        })
          .then(response => response.json())
          .then(data => {
            console.log(data.choices[0].message.content);
            outputBox.innerHTML = data.choices[0].message.content;
          })
          .catch(error => {
            console.error("Error:", error);
            outputBox.innerHTML = 'Error generating notes';
          });
      } else {
        console.error("Error: No transcription data found.");
        outputBox.innerHTML = 'Oops! Something went wrong. Please check if the API key is correct and if the audio file is compatible (MP3, WAV, M4A, WEBM, MP4, MPGA) and does not exceed 25 MB.';
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
});

document.getElementById("scrollToTopButton").addEventListener("click", function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
