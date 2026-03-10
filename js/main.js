Vue.component('kanban-board', {
    data() {
        return {
            firstColumn: [],
            secondColumn: [],
            thirdColumn: [],
            fourthColumn: []
        }
    },
    template: `
        <div class="kanban-board">
            <button class="appendTaskButton" @click="appendTaskInFirstColumn">Запланировать задачу</button>
            <div class="columns">
                <div class="column">
                    <h3>Запланированные задачи</h3>
                    <task v-for="task in firstColumn" :key="task.id"
                        @update-task="updateTask" @move-to-target-column="moveToTargetColumn" @remove-task="removeTask"
                    ></task>
                </div>
                <div class="column">
                    <h3>Задачи в работе</h3>
                    <task v-for="task in secondColumn" :key="task.id"
                        @update-task="updateTask" @move-to-target-column="moveToTargetColumn" @remove-task="removeTask"
                    ></task>
                </div>
                <div class="column">
                    <h3>Тестирование</h3>
                    <task v-for="task in thirdColumn" :key="task.id"
                        @update-task="updateTask" @move-to-target-column="moveToTargetColumn" @remove-task="removeTask"
                    ></task>
                </div>
                <div class="column">
                    <h3>Выполненные задачи</h3>
                    <task v-for="task in fourthColumn" :key="task.id"
                        @update-task="updateTask" @move-to-target-column="moveToTargetColumn" @remove-task="removeTask"
                    ></task>
                </div>
            </div>
        </div>
    `,
    methods: {
        appendTaskInFirstColumn() {
            const task = {
                id: Date.now() + Math.random(),
                title: null,
                description: null,
                deadLine: null
            }
            this.firstColumn.push(task)
        },

        updateTask(changedData) {
            const { columnIndex, taskId, field, value } = changedData;
            const currentColumn = this.getColumnByIndex(columnIndex);
            const taskIndex = currentColumn.findIndex(c => c.id === taskId)

            this.$set(currentColumn[taskIndex], field, value)
        },

        moveToTargetColumn(data) {
            const { currentColumnIndex, targetColumnIndex, taskId } = data;

            const currentColumn = this.getColumnByIndex(currentColumnIndex);
            const taskIndex = currentColumn.findIndex(c => c.id === taskId);

            currentColumn.splice(taskIndex, 1);

            const task = currentColumn[taskIndex];
            const targetColumn = this.getColumnByIndex(targetColumnIndex);
            targetColumn.push(task);


        },

        removeTask(data) {
            const {currentColumnIndex, taskId} = data;

            currentColumn = this.getColumn(currentColumnIndex);
            const taskIndex = currentColumn.findIndex(c => c.id === taskId);

            currentColumn.splice(taskIndex, 1)
        },

        getColumn(columnIndex) {
            switch (columnIndex) {
                case 0: return this.firstColumn;
                case 1: return this.secondColumn;
                case 2: return this.thirdColumn;
                case 3: return this.fourthColumn;
            }
        }


    },
    computed: {
    }
})
Vue.component('task', {
    props: {
        taskId: {
            type: [String, Number],
            required: true
        },

        card: {
            type: Object,
            required: true
        },

        columnIndex: {
            type: Number,
            required: true
        },

        cardIndex: {
            type: Number,
            required: true
        },

        fulledSecondColumn: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="task" v-show="columnIndex==0">
            <input type="text" placeholder="Заголовок" :value="task.title" @input="updateTitle($event.target.value)">
            <input type="text" placeholder="Описание" :value="task.description" @input="updateDescription($event.target.value)">
            <input type="date" placeholder="Дедлайн" :value="task.deadline" @input="updateDeadline($event.target.value)">
            <button @click="removeTask" >Удалить</button>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveToTargetColumn(1)" >(---)</button>
        </div>
    
        <div class="task" v-show="columnIndex==1">
            <input type="text" placeholder="Заголовок" :value="task.title" @input="updateTitle($event.target.value)">
            <input type="text" placeholder="Описание" :value="task.description" @input="updateDescription($event.target.value)">
            <b>{{task.deadline}}</b>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveToTargetColumn(2)" >(---)</button>
        </div>

        <div class="task" v-show="columnIndex==2">
            <input type="text" placeholder="Заголовок" :value="task.title" @input="updateTitle($event.target.value)">
            <input type="text" placeholder="Описание" :value="task.description" @input="updateDescription($event.target.value)">
            <b>{{task.deadline}}</b>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveToTargetColumn(1)" >(---)</button>
            <button @click="moveToTargetColumn(3)" >(---)</button>
        </div>

        <div class="task" v-show="columnIndex==3">
            <p>{{task.title}}</p>
            <p>{{task.description}}</p>
            <p>{{task.deadline}}</p>
            <b>{{meetingDeadline}}</b>
        </div>
    `,
    methods: {
        updateTitle(newTitle) {
            this.$emit('update-task', {
                columnIndex: this.columnIndex,
                taskId: this.taskId,
                field: 'title',
                value: newTitle
            })
        },

        updateDescription(newDescription) {
            this.$emit('update-task', {
                columnIndex: this.columnIndex,
                taskId: this.taskId,
                field: 'description',
                value: newDescription
            })
        },

        updateDeadline(newDeadLine) {
            this.$emit('update-task', {
                columnIndex: this.columnIndex,
                taskId: this.taskId,
                field: 'deadline',
                value: newDeadLine
            })
        },

        moveToTargetColumn(targetColumnIndex) {
            this.$emit('move-to-target-column', {
                currentColumnIndex: this.columnIndex,
                targetColumnIndex: targetColumnIndex,
                taskId: this.taskId
            })
        },

        removeTask() {
            this.$emit('remove-task', {
                currentColumnIndex: this.columnIndex,
                taskId: this.taskId
            })
        }
    },
    computed: {
    }
})

let app = new Vue({
    el: '#app',
    data: {
    },
    methods: {
    }
})