Vue.component('kanban-board', {
    data() {
        return {
            columns: [
                { values: [], title: "Запланированные задачи" },
                { values: [], title: "Задачи в работе" },
                { values: [], title: "Тестирование" },
                { values: [], title: "Выполненные задачи" }
            ]
        }
    },
    template: `
        <div class="kanban-board">
            <createForm @append-new-task="appendNewTaskColumn"></createForm>

            <div class="columns">
                <column v-for="(column, columnIndex) in columns" :key="columnIndex" :column="column"
                    :column-index="columnIndex" class="column" @update-column="updateColumn"
                    @move-task-to-target-column="moveTaskToTargetColumn"
                ></column>
            </div>
        </div>
    `,
    methods: {
        appendNewTaskColumn(task) {
            this.columns[0].values.push(task);
        },

        updateColumn(column, columnIndex) {
            this.columns.splice(columnIndex, 1, column);
        },

        moveTaskToTargetColumn(task, taskIndex, currentColumnIndex, targetColumnIndex) {
            const currentColumn = this.columns[currentColumnIndex];
            const targetColumn = this.columns[targetColumnIndex];

            currentColumn.values.splice(taskIndex, 1);
            targetColumn.values.push(task);
        },


    },
    computed: {
    }
})

Vue.component('createForm', {
    props: {
    },

    data() {
        return {
            title: '',

            description: '',

            deadline: ''
        }
    },

    template: `
        <form class="createForm" @submit.prevent="onSubmitCreateForm">
            <label for="title">Заголовок</label>
            <input id="title" required type="text" placeholder="Заголовок" v-model="title">
            <label for="description">Описание</label>
            <input id="description" required type="text" placeholder="Описание" v-model="description">
            <label for="deadline">Дедлайн</label>
            <input id="deadline" required type="date" placeholder="Дедлайн" v-model="deadline">
            <button type="submit">Создать</button>
        </form>
    `,
    methods: {
        onSubmitCreateForm() {
            this.$emit('append-new-task', this.taskByData)
            this.title = '';
            this.description = '';
            this.deadline = '';
        }
    },
    computed: {
        taskByData() {
            return {
                id: Date.now() + Math.random(),
                createAt: Date.now(),
                updateAt: Date.now(),
                title: this.title,
                description: this.description,
                deadline: this.deadline,
                reasonReturn: null
            }
        }
    }
})

Vue.component('column', {
    props: {

        column: {
            type: Object,
            required: true
        },

        columnIndex: {
            type: Number,
            required: true
        }

    },
    template: `
        <div class="column">
            <h3>{{column.title}}</h3>
            <task v-for="(task, index) in column.values"
                :key="task.id" :task="task" :column-index="columnIndex" :task-id="task.id"
                @update-task="updateTask" @move-to-target-column="moveToTargetColumn" @remove-task="removeTask"
            ></task>
        </div>
    `,
    methods: {
        updateTask(editdData) {
            const { taskId, field, value } = editdData;
            const taskIndex = this.column.values.findIndex(c => c.id === taskId)

            if (taskIndex === -1) return;
            this.$set(this.column.values[taskIndex], field, value)
            this.$set(this.column.values[taskIndex], 'updateAt', Date.now());
            this.$emit('update-column', this.column, this.columnIndex)
        },

        removeTask(taskId) {
            const taskIndex = this.column.values.findIndex(c => c.id === taskId);

            this.column.values.splice(taskIndex, 1)

            this.$emit('update-column', this.column, this.columnIndex)
        },

        moveToTargetColumn(targetColumnIndex, taskId) {
            const taskIndex = this.column.values.findIndex(c => c.id === taskId);

            if (taskIndex === -1) return;

            const task = this.column.values[taskIndex];

            this.$emit('move-task-to-target-column', task, taskIndex, this.columnIndex, targetColumnIndex)

        },
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

        task: {
            type: Object,
            required: true
        },

        columnIndex: {
            type: Number,
            required: true
        }
    },

    data() {
        return {
            showEditForm: false
        }
    },

    template: `
        <div class="task">
            <editForm :task="task" :column-index="columnIndex" :show-edit-form="showEditForm" @edit-task="editTask"></editForm>
            <div>
                <p>Заголовок: {{task.title}}</p>
                <p>Описание: {{task.description}}</p>
                <p>Дедлайн: {{task.deadline}}</p>

                <p v-if="task.reasonReturn && columnIndex === 1">Причина возврата: {{task.reasonReturn}}</p>

                <div v-if="columnIndex == 2">
                    <button @click="moveToTargetColumn(1)">Вернуть</button>
                    <input type="text" placeholder="Причина возврата" :value="task.reasonReturn" @input="updateReasonReturn($event.target.value)">
                </div>

                <button @click="removeTask" v-if="columnIndex == 0">Удалить</button>

                <button v-if="showEditForm==false && columnIndex !== 3" @click="toggleEditForm">Изменить</button>
                <button v-if="showEditForm==true && columnIndex !== 3" @click="toggleEditForm">Не изменять</button>

                <button @click="moveToTargetColumn(columnIndex+1)" v-if="columnIndex !== 3">Вперед</button>

                <b v-if="meetingDeadline && columnIndex == 3">Статус: {{meetingDeadline}}</b>
                
                <b>Редактировано: {{formattedUpdateAt}}</b>
            </div>

        </div>
    `,
    methods: {

        updateReasonReturn(newReasonReturn) {
            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'reasonReturn',
                value: newReasonReturn
            })

        },

        moveToTargetColumn(targetColumnIndex) {
            this.$emit('move-to-target-column', targetColumnIndex, this.taskId);
        },

        removeTask() {
            this.$emit('remove-task', this.taskId);
        },

        toggleEditForm() {
            this.showEditForm = !this.showEditForm
        },

        editTask(title, description, deadline) {
            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'title',
                value: title
            });
            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'description',
                value: description
            });
            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'deadline',
                value: deadline
            });
            showEditForm = false;
        }

    },
    computed: {
        meetingDeadline() {
            if (!this.task.deadline) return '';
            return new Date(this.task.deadline) < new Date() ? 'Просрочено' : 'В срок';
        },

        formattedUpdateAt() {
            if (!this.task.updateAt) return '';
            return new Date(this.task.updateAt).toLocaleString('ru-RU');
        }
    }
})

Vue.component('editForm', {
    props: {
        task: {
            type: Object,
            required: true
        },

        columnIndex: {
            type: Number,
            required: true
        },

        showEditForm: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            title: '',

            description: '',

            deadline: ''
        }
    },

    template: `
        <form class="editForm" @submit.prevent="onSubmitEditForm" v-if="showEditForm">
            <label for="title">Заголовок</label>
            <input id="title" required type="text" placeholder="Заголовок" v-model="title">
            <label for="description">Описание</label>
            <input id="description" required type="text" placeholder="Описание" v-model="description">
            <label v-if="columnIndex==0" for="deadline">Дедлайн</label>
            <input v-if="columnIndex==0" id="deadline" required type="date" placeholder="Дедлайн" v-model="deadline">
            <button type="submit">Изменить</button>
        </form>
    `,
    methods: {
        onSubmitEditForm() {
            this.$emit('edit-task', this.title, this.description, this.deadline);
            this.title = '';
            this.description = '';
            this.deadline = '';
        }
    },

    watch: {
        showEditForm: {
            handler(val) {
                if (val) {
                    this.title = this.task.title;
                    this.description = this.task.description;
                    this.deadline = this.task.deadline;
                }
            },
            immediate: true
        },
        task: {
            handler(newTask) {
                if (this.showEditForm) {
                    this.title = newTask.title;
                    this.description = newTask.description;
                    this.deadline = newTask.deadline;
                }
            },
            deep: true
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