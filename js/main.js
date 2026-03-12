Vue.component('kanban-board', {
    data() {
        return {
            columns: [
                { values: [], title: "Запланированные задачи", show: true },
                { values: [], title: "Задачи в работе", show: true },
                { values: [], title: "Тестирование", show: true },
                { values: [], title: "Выполненные задачи", show: true },
                { values: [], title: "Архив", show: false }
            ]
        }
    },
    template: `
        <div class="kanban-board">
            <button @click="toggleVisibleArhive" class="toggle-archive-btn">{{ columns[4].show ? 'Скрыть архив' : 'Показать архив' }}</button>
            <createForm @append-new-task="appendNewTaskColumn"></createForm>

            <div class="columns">
                <column v-for="(column, columnIndex) in columns" :key="columnIndex" :column="column"
                    :column-index="columnIndex" class="column" @update-column="updateColumn"
                    @move-task-to-target-column="moveTaskToTargetColumn" v-if="column.show"
                ></column>
            </div>
        </div>
    `,
    methods: {

        toggleVisibleArhive() {
            this.$set(this.columns[4], 'show', !this.columns[4].show)
        },

        appendNewTaskColumn(task) {
            this.columns[0].values.push(task);
        },

        updateColumn(column, columnIndex) {
            this.columns.splice(columnIndex, 1, column);
        },

        moveTaskToTargetColumn(task, taskIndex, currentColumnIndex, targetColumnIndex) {

            if (targetColumnIndex == 3 && new Date(task.deadline) < new Date()) {
                targetColumnIndex = 4
            }

            const currentColumn = this.columns[currentColumnIndex];
            const targetColumn = this.columns[targetColumnIndex];

            if (targetColumnIndex !== 3 || targetColumnIndex == 3 && task.notes.every(note => note.checked === true)) {
                currentColumn.values.splice(taskIndex, 1);
                targetColumn.values.push(task);
            }
            else {
                return;
            }

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

            deadline: '',

            notes: [],

            currentNote: ''
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
            <label>Действия (макс. 3)</label>
            <div class="notes-section">
                <div v-for="(note, index) in notes" :key="index" class="note-item">
                    <span>{{ note.text }}</span>
                    <button type="button" @click="removeNote(index)" class="remove-note">Удалить</button>
                </div>
                <div v-if="notes.length < 3" class="add-note">
                    <input type="text" placeholder="Введите действик" v-model="currentNote">
                    <button type="button" @click="addNote" :disabled="!currentNote.trim()">Добавить</button>
                </div>
                <p v-else class="note-limit">Достигнут лимит действий (3)</p>
            </div>  
            <button type="submit">Создать</button>
 
        </form>
    `,
    methods: {
        addNote() {
            if (this.notes.length < 3 && this.currentNote.trim() !== '') {
                this.notes.push({ text: this.currentNote, checked: false });
                this.currentNote = '';
            }
        },

        removeNote(index) {
            this.notes.splice(index, 1);
        },

        onSubmitCreateForm() {
            this.$emit('append-new-task', this.taskByData)
            this.title = '';
            this.description = '';
            this.deadline = '';
            this.currentNote = '';
            this.notes = [];
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
                reasonReturn: null,
                notes: this.notes
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

                <ul>
                    <li v-for="(note, noteIndex) in task.notes" :key="noteIndex">
                        <note :note="note" :task-id="task.id" :note-index="noteIndex" @update-note="updateNote" :column-index="columnIndex"></note>
                    </li>
                </ul>

                <p v-if="task.reasonReturn && columnIndex === 1">Причина возврата: {{task.reasonReturn}}</p>

                <div v-if="columnIndex == 2">
                    <button @click="moveToTargetColumn(1)" :disabled="!task.reasonReturn">Вернуть</button>
                    <input type="text" placeholder="Причина возврата" :value="task.reasonReturn" @input="updateReasonReturn($event.target.value)">
                </div>

                <button @click="removeTask" v-if="columnIndex == 0">Удалить</button>

                <button v-if="showEditForm==false && columnIndex < 3" @click="toggleEditForm">Изменить</button>
                <button v-if="showEditForm==true && columnIndex < 3" @click="toggleEditForm">Не изменять</button>

                <button @click="moveToTargetColumn(columnIndex+1)" v-if="columnIndex < 3">Вперед</button>

                <b v-if="meetingDeadline && columnIndex == 3">Статус: {{meetingDeadline}}</b>

                <button @click="moveToTargetColumn(4)" v-if="columnIndex == 3 && columnIndex == 4">В архив</button>

                <b>Редактировано: {{formattedUpdateAt}}</b>
            </div>

        </div>
    `,
    methods: {
        updateNote(noteIndex, checked) {
            const notes = this.task.notes;

            if (noteIndex < 0 || noteIndex >= notes.length) return;

            const updatedNotes = [...notes];
            updatedNotes[noteIndex] = { ...notes[noteIndex], checked };

            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'notes',
                value: updatedNotes
            });
        },

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

        editTask(title, description, deadline, notes) {
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
            this.$emit('update-task', {
                taskId: this.taskId,
                field: 'note',
                value: notes
            });
            this.showEditForm = false;
        },

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

Vue.component('note', {
    props: {
        note: {
            type: Object,
            required: true
        },

        columnIndex: {
            type: Number,
            required: true
        },

        noteIndex: {
            type: Number,
            required: true
        }
    },


    template: `
        <div class="note">
            <div>
                <input :disabled="columnIndex>2" type="checkbox" :checked="note.checked" @change="onChange">
                <p>{{note.text}}</p>
            </div>
        </div>
    `,

    methods: {
        onChange(e) {
            this.$emit('update-note', this.noteIndex, e.target.checked)
        }
    },

    computed: {
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

            deadline: '',

            noteText: '',

            notes: []
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

            <label for="note">Действия</label>
            <div v-for="(note, noteIndex) in notes" id="note">
                <input id="noteText" required type="text" placeholder="текст действия" v-model="note.text">
            </div>
            <button type="submit">Изменить</button>
        </form>
    `,
    methods: {
        onSubmitEditForm() {
            this.$emit('edit-task', this.title, this.description, this.deadline, this.notes);
            this.title = '';
            this.description = '';
            this.deadline = '';
            this.notes = [];
        }
    },

    watch: {
        showEditForm: {
            handler(val) {
                if (val) {
                    this.title = this.task.title;
                    this.description = this.task.description;
                    this.deadline = this.task.deadline;
                    this.notes = this.task.notes;
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
                    this.notes = newTask.notes;
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