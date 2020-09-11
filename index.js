const TOKEN = 'MY_TOKEN'
const { Telegraf } = require('telegraf')

const bot = new Telegraf(TOKEN)
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
let id = 0
let TeacherPUSH = ''
let subPUSH = ''
const group = 'M3106'

db.defaults({ info: [] })
  .write()

bot.start((ctx) => {
  ctx.reply(`
_/list_ - отсылает все дедлайны с датами
_/add_ - добавляет новый дедлайн 
_/remove_ - удаляет ошибочный дедлайн 
_/sos_ - отправляет шпаргалку по преподам, их системам сдачи лаб, все конспекты и тд 
_/help_ - получи помощь по использованию бота
  `, { parse_mode: 'Markdown' })
})

bot.command('list', (ctx) => {
  const arrayLength = db.get('info').value().length
  const text = []
  for (let i = 0; i < arrayLength; i++) {
    db.get(`info[${i}]`).assign({ count: i + 1 }).write()
    text[i] = `
${db.get('info').sortBy('count').value()[i].count}. *${db.get('info').sortBy('count').value()[i].type}*
👨🏻‍🏫 _Учитель_ -  *${db.get('info').sortBy('count').value()[i].teacher}*
🗓 _Дата сдачи_ - *${db.get('info').sortBy('count').value()[i].date}*`
  }
  if (arrayLength === 0) {
    ctx.reply('🎰 *Дедлайнов нет!* 🎰', { parse_mode: 'Markdown' })
  } else {
    ctx.reply(`
📍 *Дедлайны для ${group}* 📍
${text.join('\n ')}
  
_Если ты знаешь еще какие-то дедлайны, то добавь их в бота по команде /add, все будут благодарны_
  `, { parse_mode: 'Markdown' })
  }
})

bot.hears(/add ([а-я.]+) (.+)/, ({ reply, match }) => {
  const SUBJECT = new RegExp(match[1], 'gim')
  const DATE = match[2]
  const LENGTH_ARRAY_TEACHERS = 6

  id += 1
  for (let i = 0; i < LENGTH_ARRAY_TEACHERS; i++) {
    if (db.get(`teachers[${i}].subject`).value().match(SUBJECT)) {
      subPUSH = db.get(`teachers[${i}].subject`).value()
      for (let j = 0; j < LENGTH_ARRAY_TEACHERS; j++) {
        if (db.get(`teachers[${j}].subject`).value() === subPUSH) {
          TeacherPUSH = db.get(`teachers[${j}].teacher`).value()
        }
      }
    }
  }

  db.get('info').push({
    type: subPUSH,
    teacher: TeacherPUSH,
    date: DATE,
    count: id
  }).write()
  reply('Спасибо, добавил лабу ✅')
})

bot.hears(/remove (.+)/, ({ reply, match }) => {
  const arrayLength = db.get('info').value().length
  const number = match[1]
  db.get('info').remove({ count: parseInt(number, 10) }).write()
  if (arrayLength > 0 && number !== 'all') {
    reply(`Удалил лабу под номером ${number}🚫`)
  } else if (number > 0) {
    reply('Лаб нету, нечего удалять')
  }

  if (number === 'all') {
    db.get('info').remove().write()
    reply('Стер все лабы')
  }
})

bot.hears('/add', (ctx) => ctx.reply('Ошибка! Где мне взять дату и название предмета?'))
bot.hears('/remove', (ctx) => ctx.reply('Ошибка! Какой номер лабы из списка мне нужно удалить?'))

bot.command('sos', (ctx) => {
  ctx.reply(
`❗*Информация о преподах и их системах*❗

1. *Программирование*
· Препод - _Повышев Владислав Вячеславович_
· Лабы - [тык](https://yadi.sk/d/zzdHYM-D5kJmNQ?w=1)
· Чатик - [тык](https://t.me/c/1281776413/534)
· Сдаем раз в 2 недели, т.е. к каждой практике 

2. *Алгоритмы и структуры данных*
· Препод - _Буланова Нина Сергеевна_
· Лабы - [тык](https://pcms.itmo.ru/pcms2client/party/contests.xhtml)
· Сдаем раз в 2 недели, т.е. к каждой практике

3. *Линейная алгебра*
· Препод - _Москаленко Мария Александровна_
· Лабы - [тык](http://mathdep.ifmo.ru/mmtp/linal-angem/)
· Чатик - [тык](https://t.me/joinchat/CGYtSB2cM3z3W6Bq4hgIWA)
· Сдаем каждую неделю (?)

4. *Дискретная математика*
· Препод лекций - _Буланова Нина Сергеевна_
· Препод лаб - _Суворов Дмитрий Михайлович_
· Лабы - [тык](http://mathdep.ifmo.ru/mmtp/linal-angem/) (еще неизвестно, будут ли они вообще)
· Частота сдачи неизвестна

5. *Архитектура ЭВМ*
· Препод лекций - _Повышев Владислав Вячеславович_
· Преподы лаб - _Полина и Даня_
· Чатик - [тык](https://t.me/joinchat/Gss_bRjGd-IWGuAMiJTAxw)
· Лабы - [тык](https://oshnix.site/)
· Сдаем д/з и лабы раз в 2 недели, т.е. к каждой практике 

6. *Введение в цифровую культуру и программирование*
· Препод лаб - _Страдина Марина Владимировна_
· Лабы - [тык](https://piazza.com/niuitmo.ru/summer2020/cs101/resources)
· Сдаем раз в 2 недели, т.е. к каждой практике (?)


🎯 *Предметы с зачетом* 🎯
· _Архитектура ЭВМ_ (Дифференцированный)
·  _Английский язык_
· _Введение в цифровую культуру и программирование_
· _Программирование_ (Дифференцированный)
· _Физра_

*Предметы с оценками:*
· _Алгоритмы и структуры данных_
· _Дискретная математика_
· _Линейная алгебра_
· _Математический анализ_


——————————
🔥 *Ссылки-спасатели на весь семестр* 🔥 
1. [Материалы почти для всего с Notion](https://www.notion.so/289f9628e0ac4ae3b779d68b629ac0dd)
2. [Гитхаб с контактами, информацией по баллам и конспектами](https://github.com/y0f0/ITMO)
3. [Книжки и конспекты](https://drive.google.com/drive/folders/1JTte1XlZI47KAA0DD780_4w0haidU49e)

_Какие-то данные могут быть неточными, напишите автору бота, чтобы он исправил_`, { parse_mode: 'Markdown' })
})

bot.command('help', (ctx) => {
  ctx.reply(`
Автор бота - @sashafromlibertalia

Как использовать *add* и *remove*?
Для *add* пишите предмет лабы и дату. Все.
Для *remove* пишите порядковый номер лабы. Все.
----------------
_/add прога 21 сентября_

_/remove 3_
----------------

[Репозиторий](github.com/sashafromlibertalia/ITMO_DeadlineBot) `, { parse_mode: 'Markdown' })
})

bot.launch()
