import {asyncActions as taskAsyncActions} from "./tasks-reducer";
import {asyncActions as todolistAsyncActions} from "./todolists-reducer";

const todolistActions = {
    ...todolistAsyncActions
}

const taskActions = {
    ...taskAsyncActions
}

export {
    taskActions,
    todolistActions
}