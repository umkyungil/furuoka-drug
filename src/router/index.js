import Vue from "vue";
import Router from "vue-router";
import store from "../vuex/index";

Vue.use(Router);  

//主路由
const routes = [
  {
    path: "/",
    component: resolve => require(["../views/login/login.vue"], resolve)
  },
  {
    path: "/login",
    component: resolve => require(["../views/login/login.vue"], resolve)
  },
  {
    path: "/meet",
    component: resolve => require(["../views/home/index.vue"], resolve)
  },
  // 일치하지 않는 경우 404가 반환되고 경로는 위에서 아래로 순서대로 일치됩니다. 마지막 *는 모두 일치할 수 있으며,
];

const router = new Router({
  mode: 'history',
  hashbang: true,
  history: true,
  transitionOnLoad: true,
  routes
});

/*commmon 페이지 새로고침 및 재할당*/
//공개 매개변수 재할당
if (hgetStore("hvuex")) {
  store.dispatch("hvuex", JSON.parse(hgetStore("hvuex")));
}
//方便修改 수정하기 쉬움
export async function hvuex(obj) {
  return store.dispatch("hvuex", obj);
}
window.hvuex = hvuex;
//拦截
router.beforeEach((to, from, next) => {
  next();
  if(to.path=='/'&&from.path!='/'){
    setTimeout(()=>{
      window.location.reload();
    },200);
  }
});

export default router;
