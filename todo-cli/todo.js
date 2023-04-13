const todoList = () => {
  all = []
 const add = (todoItem) => {
   all.push(todoItem)
 }
 const markAsComplete = (index) => {
   all[index].completed = true
 }

 const overdue = () => {
   return all.filter((item) => item.dueDate < new Date().toLocaleDateString("en-CA"));
 }

 const dueToday = () => {
  return all.filter((item) => item.dueDate === new Date().toLocaleDateString("en-CA"));
 }

 const dueLater = () => {
  return all.filter((item) => item.dueDate > new Date().toLocaleDateString("en-CA"));
 }

 function toDisplayableList(list) {
     return list.map(item => `${item.completed ? '[x]' : '[ ]' } ${item.title} ${item.dueDate === new Date().toLocaleDateString("en-CA")}`)
}
 return { all, add, markAsComplete, overdue, dueToday, dueLater, toDisplayableList };
}

module.exports = todoList;