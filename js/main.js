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
                    <task v-for="card in firstColumn" :key="task.id"></task>
                </div>
                <div class="column">
                    <h3>Задачи в работе</h3>
                    <task v-for="card in secondColumn" :key="task.id"></task>
                </div>
                <div class="column">
                    <h3>Тестирование</h3>
                    <task v-for="card in thirdColumn" :key="task.id"></task>
                </div>
                <div class="column">
                    <h3>Выполненные задачи</h3>
                    <task v-for="card in fourthColumn" :key="task.id"></task>
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

let app = new Vue({
    el: '#app',
    data: {
    },
    methods: {
    }
})