setInterval(function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/stats');
  xhr.onload = function() {
      if (xhr.status === 200) {
          document.getElementById('stats').innerHTML = xhr.responseText;
      }
  };
  xhr.send();
}, 1000)