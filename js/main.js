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
                    <task v-for="task in firstColumn" :key="task.id" @update-task="updateTask"></task>
                </div>
                <div class="column">
                    <h3>Задачи в работе</h3>
                    <task v-for="task in secondColumn" :key="task.id" @update-task="updateTask"></task>
                </div>
                <div class="column">
                    <h3>Тестирование</h3>
                    <task v-for="task in thirdColumn" :key="task.id" @update-task="updateTask"></task>
                </div>
                <div class="column">
                    <h3>Выполненные задачи</h3>
                    <task v-for="task in fourthColumn" :key="task.id" @update-task="updateTask"></task>
                </div>
            </div>
        </div>
    `,
    methods: {
    },
    computed: {
    }
    //Можно сделать также наследник под название task а в нем уже в шаблоне
    //бахнуть 4 дива в которых будет проверка на то, в каком столбце (этапе) находится задача
    //и в зависимости от этого менять контент
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
            <button @click="deleteTask" >Удалить</button>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveToSecondColumn" >(---)</button>
        </div>
    
        <div class="task" v-show="columnIndex==1">
            <input type="text" placeholder="Заголовок" :value="task.title" @input="updateTitle($event.target.value)">
            <input type="text" placeholder="Описание" :value="task.description" @input="updateDescription($event.target.value)">
            <b>{{task.deadline}}</b>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveToThirdColumn" >(---)</button>
        </div>

        <div class="task" v-show="columnIndex==2">
            <input type="text" placeholder="Заголовок" :value="task.title" @input="updateTitle($event.target.value)">
            <input type="text" placeholder="Описание" :value="task.description" @input="updateDescription($event.target.value)">
            <b>{{task.deadline}}</b>
            <b>{{formattedLastCompletedAt}}</b>
            <button @click="moveBackToSecondhColumn" >(---)</button>
            <button @click="moveToFourthColumn" >(---)</button>
        </div>

        <div class="task" v-show="columnIndex==3">
            <p>{{task.title}}</p>
            <p>{{task.description}}</p>
            <p>{{task.deadline}}</p>
            <b>{{meetingDeadline}}</b>
        </div>
    `,
    methods: {
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