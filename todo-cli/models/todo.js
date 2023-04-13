// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Todo extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here

//     }
//     static async showList(){
//       console.log(await Todo.findAll());
//     }
//     static async addTask(params) {
//       return await Todo.create(params);
//     }
//   }
//   Todo.init({
//     title: DataTypes.STRING,
//     dueDate: DataTypes.DATEONLY,
//     completed: DataTypes.BOOLEAN
//   }, {
//     sequelize,
//     modelName: 'Todo',
//   });
//   return Todo;
// };


// models/todo.js
'use strict';
const {
  Model,Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const overdueTodos = await Todo.overdue();
      console.log((overdueTodos.map((todo) => {
          return todo.displayableString();
        })).join("\n"));

      console.log("\n");

      const dueTodayTodos = await Todo.dueToday();
      console.log("Due Today");
      // FILL IN HERE
      console.log((dueTodayTodos.map((todo) => {
        return todo.displayableString();
      })).join("\n"));

      console.log("\n");
      
      console.log("Due Later");
      const dueLaterTodos = await Todo.dueLater();
      // FILL IN HERE
      console.log((dueLaterTodos.map((todo) => {
        return todo.displayableString();
      })).join("\n"));
    }
    
    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const tod = await Todo.findAll({where: {dueDate: {[Op.lt]: new Date().toLocaleDateString("en-CA"),},},});
      // return (tod.map((todo) => {
      //   return todo.displayableString();
      // })).join("\n");
      return tod;
    }
    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const tod = await Todo.findAll({where: {dueDate: {[Op.eq]: new Date().toLocaleDateString("en-CA"),},},});
      // return (tod.map((todo) => {
      //   return todo.displayableString();
      // })).join("\n");
      return tod;
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const tod = await Todo.findAll({where: {dueDate: {[Op.gt]: new Date().toLocaleDateString("en-CA"),},},});
      // return (tod.map((todo) => {
      //   return todo.displayableString();
      // })).join("\n");
      return tod;
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      await Todo.update({ completed: true },{where: {id: id,},});
    }

    // displayableString() {
    //   let checkbox = this.completed ? "[x]" : "[ ]";
    //   let x=(this.dueDate===new Date().toLocaleDateString("en-CA")?"":this.dueDate);
    //   let msg = `${this.id}. ${checkbox} ${this.title} ${x}`;
    //   msg = msg.trimEnd();
    //   return msg;
    // }
    displayableString() {
      const today = new Date().toISOString().slice(0, 10);
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${
        this.dueDate === today ? "" : this.dueDate
      }`.trim();
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};