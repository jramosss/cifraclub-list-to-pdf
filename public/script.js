document.addEventListener("DOMContentLoaded", () => {
  const idInput = document.getElementById("idInput");
  const convertButton = document.getElementById("convertButton");
  const pdfLink = document.getElementById("pdfLink");
  const downloadLink = document.getElementById("downloadLink");
  const errorMessageParagraph = document.getElementById("errorMessage");

  convertButton.addEventListener("click", async () => {
      const id = idInput.value;
      if (!id) {
            console.log("Missing musician_id!!!")
            errorMessageParagraph.innerText = "Missing musician_id";
            return;
      }      

      fetch('http://localhost:3000/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ musician_id: id }),
      }).then(response => {
          console.log({ response })
          if (!response.ok) {
                response.json().then(({ error }) => {
                    errorMessageParagraph.innerText = error
                    return
                })
          }
          response.json().then(({ url }) => {
              if (url) {
                  pdfLink.href = url;
                  downloadLink.style.display = "block";
              }
          })

      })
  });
});