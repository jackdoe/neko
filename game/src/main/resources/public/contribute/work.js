var question = document.getElementById('question')
var answer = document.getElementById('answer')
var button = document.getElementById('add')
var output = document.getElementById('json')

var sentences = []
wanakana.bind(question)

var dump = function () {
  output.innerHTML = JSON.stringify(
    sentences.filter(e => e.q.length > 0),
    null,
    2
  )
}
var add = function () {
  dump()
  let do_add = true
  if (sentences.length > 0) {
    let last = sentences[sentences.length - 1]
    if (last.q.length === 0 || last.q.length === 0) {
      do_add = false
    }
  }
  if (do_add) sentences.push({ q: '', a: '' })

  question.value = ''
  answer.value = ''
}

var append = function (event) {
  if (sentences.length === 0) add()

  let last = sentences[sentences.length - 1]
  last.q = question.value
  last.a = answer.value
  dump()
}

question.addEventListener('input', append)
answer.addEventListener('input', append)
button.addEventListener('click', add)

var isCtrl = false
document.onkeyup = function (e) {
  if (e.keyCode == 17) isCtrl = false
}

document.onkeydown = function (e) {
  if (e.keyCode == 17) isCtrl = true
  if (e.keyCode == 83 && isCtrl == true) {
    add()
    question.focus()
    return false
  }
}
