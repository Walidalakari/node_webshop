const form = document.querySelector('form');

form.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(form);

  fetch('/p', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});
