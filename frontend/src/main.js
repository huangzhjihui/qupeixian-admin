import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import 'vant/lib/index.css'
import { Button, Cell, CellGroup, Icon, Image as VanImage, NavBar, Tab, Tabs, Tabbar, TabbarItem, Swipe, SwipeItem, Card, Search, NoticeBar, Stepper, SubmitBar, Checkbox, CheckboxGroup, Form, Field, Popup, Picker, DatePicker, Pagination, ActionSheet, Dialog, Toast, Loading, Empty, TreeSelect, Switch, Tag, Rate, PullRefresh, List, Badge, Grid, GridItem, Divider, Area, Col, Row, Step, Steps, ImagePreview, Lazyload, Skeleton, PasswordInput, NumberKeyboard, Radio, RadioGroup, Uploader } from 'vant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useUserStore } from '@/store/user'
const userStore = useUserStore()
userStore.initUserSession()

app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Icon)
app.use(VanImage)
app.use(NavBar)
app.use(Tab)
app.use(Tabs)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Swipe)
app.use(SwipeItem)
app.use(Card)
app.use(Search)
app.use(NoticeBar)
app.use(Stepper)
app.use(SubmitBar)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Form)
app.use(Field)
app.use(Popup)
app.use(Picker)
app.use(DatePicker)
app.use(Pagination)
app.use(ActionSheet)
app.use(Dialog)
app.use(Toast)
app.use(Loading)
app.use(Empty)
app.use(TreeSelect)
app.use(Switch)
app.use(Tag)
app.use(Rate)
app.use(PullRefresh)
app.use(List)
app.use(Badge)
app.use(Grid)
app.use(GridItem)
app.use(Divider)
app.use(Area)
app.use(Col)
app.use(Row)
app.use(Step)
app.use(Steps)
app.use(ImagePreview)
app.use(Lazyload)
app.use(Skeleton)
app.use(PasswordInput)
app.use(NumberKeyboard)
app.use(Radio)
app.use(RadioGroup)
app.use(Uploader)

app.mount('#app')
