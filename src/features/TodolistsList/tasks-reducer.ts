//import {addTodolistTC,
// changeTodolistTitleTC,
// fetchTodolistsTC,
// removeTodolistTC} from './todolists-reducer'
import {todolistActions} from './'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const initialState: TasksStateType = {}

const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    const res = await todolistsAPI.getTasks(todolistId)
    const tasks = res.data.items
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
    return {tasks, todolistId}
})

const removeTaskTC = createAsyncThunk('tasks/removeTask', async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId)
    return {taskId: param.taskId, todolistId: param.todolistId}
})

const addTaskTC = createAsyncThunk('tasks/addTask', async (param: { title: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return res.data.data.item
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return thunkAPI.rejectWithValue({})
        }
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({})
    }
})

const updateTaskTC = createAsyncThunk('task/updateTask',
    async (param: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {

        const state = thunkAPI.getState() as AppRootStateType
        const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            //console.warn('task not found in the state')
            return thunkAPI.rejectWithValue('task not found in the state')
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...param.model
        }

        try {
            const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
            if (res.data.resultCode === 0) {
                return param
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch);
                return thunkAPI.rejectWithValue({})
            }
        } catch (err: any) {
            const error: AxiosError = err
            handleServerNetworkError(error, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({})
        }
    })

export const asyncActions = {
    fetchTasksTC,
    removeTaskTC,
    addTaskTC,
    updateTaskTC
}

const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(todolistActions.addTodolistTC.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = []
        })
        builder.addCase(todolistActions.removeTodolistTC.fulfilled, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(todolistActions.fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        })
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        })
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id == action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        })
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            state[action.payload.todoListId].unshift(action.payload)
        })
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id == action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        })
    }
})

export const tasksReducer = slice.reducer

// export const {
//     //removeTaskAC,
//     //addTaskAC,
//     //updateTaskAC,
// } = slice.actions


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
// type ActionsType =
//     | ReturnType<typeof removeTaskAC>
//     | ReturnType<typeof addTaskAC>
//     | ReturnType<typeof updateTaskAC>
//     | AddTodolistActionType
//     | RemoveTodolistActionType
//     | SetTodolistsActionType
//     | ReturnType<typeof setTasksAC>
// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
