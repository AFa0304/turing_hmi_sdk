import { setOrders, setRouteData, setCurrentGoal } from "../../../src/redux/reducers/global";
import { setUpdatePath } from "../../../src/redux/reducers/ros";
import { ReduxManager } from "./index";

/*
  auto dispatch by order time 
*/

class OrderDispatch {
    orders = [];
    timer = undefined;
    ros = undefined;
    store = undefined;
    reducers = undefined;
    disableSetGoal = false;
    isSettingArrivedGoal = false;
    currentGoal = undefined;

    init = () => {
        this.store = ReduxManager.getStore();
        if (this.store) {
            // 保存上一個 state
            let previousState = this.store.getState();
            // 監聽 state 變化
            this.store.subscribe(() => {
                const currentState = this.store.getState();
                if (previousState?.ros.autowareState !== currentState?.ros.autowareState) {
                    console.warn(`autoware state 從 ${previousState?.ros.autowareState} 變成了 ${currentState.ros.autowareState}`);
                    const currentProcessingOrder = currentState.global.orders?.find((x) => x.order.state === "processing");
                    if (currentProcessingOrder && this.ros) {
                        this.executeOrder();
                    }
                }
                previousState = currentState;
            });

            this.timer = setInterval(() => {
                // console.log(`auto dispatch time interval -- ${new Date().getTime()}`, this.orders);
                this.checkAndSetOrder();
            }, 1000);
        } else {
            console.error("Before init, setStore must be executed on ReduxManager.");
        }
    };

    registerROS = (ros) => {
        this.ros = ros || undefined;
    };

    setOrders = (orders) => {
        if (!orders) {
            return;
        }
        this.orders = orders;
    };

    //
    checkAndSetOrder = () => {
        // order state: idle, processing, end
        const state = this.store.getState();
        let orderCopy = JSON.parse(JSON.stringify(this.orders));
        if (orderCopy.length) {
            const processingOrderIndex = orderCopy.findIndex((x) => x?.order?.state === "processing");
            if (processingOrderIndex === -1) {
                // 若無訂單在執行中
                const currentTime = new Date().getTime();
                const idleOrderSort = orderCopy.filter((x) => {
                    return x.order.state === "idle" && x.order.execute_timestamp <= currentTime;
                });
                idleOrderSort.sort((a, b) => {
                    return a.order.execute_timestamp - b.order.execute_timestamp;
                });
                // 執行timestamp最早且應執行訂單
                if (idleOrderSort[0]) {
                    /*
                      在此發送執行訂單API給互橙
                    */
                    // console.log(idleOrderSort[0], "此筆訂單將被processing");
                    idleOrderSort[0].order.state = "processing";
                    this.ros.clearRoute();
                    this.setStationDataByOrder(idleOrderSort[0]);
                    this.store.dispatch(setOrders(orderCopy));
                    this.setOrders(orderCopy);
                    this.executeOrder();
                } else if (state.ros.autowareState === 6) {
                    // 若沒有訂單要執行且autowareState == arrived 則 clear route
                    this.ros.clearRoute();
                    this.setStationDataByOrder();
                }
            } else {
                // console.log("已有訂單執行中");
                this.setStationDataByOrder(orderCopy[processingOrderIndex]);
            }
        }
    };

    setStationDataByOrder = (order) => {
        if (order) {
            if (JSON.stringify(order.group.goal_points) !== JSON.stringify(this.store.getState().global.routeData)) {
                this.store.dispatch(setRouteData(order.group.goal_points));
            }
        } else {
            this.store.dispatch(setRouteData());
        }
    };

    executeOrder = () => {
        const state = this.store.getState();
        const processingOrder = state.global.orders?.find((x) => x.order.state === "processing");
        const autowareState = state.ros.autowareState;
        // const routeState = state.ros.routingStatus;
        if (autowareState === 6) {
            // arrived
            this.setArrivedGoal();
        }
        if (autowareState === 2) {
            // waiting for route
            const goalPoints = processingOrder.group.goal_points;
            this.currentGoal = goalPoints.find((x) => x.status === 0);
            if (this.currentGoal) {
                // console.log("將設定站點", this.currentGoal);
                this.setGoal(this.currentGoal);
            } else {
                // console.log("找不到站點", this.currentGoal);
            }
        }
    };

    setArrivedGoal = () => {
        if (!this.isSettingArrivedGoal) {
            /*
              在此發送站點已抵達API給互橙
            */
            this.isSettingArrivedGoal = true;
            const orderCopy = JSON.parse(JSON.stringify(this.orders));
            let processingOrder = orderCopy.find((x) => x.order.state === "processing");
            if (processingOrder) {
                const targetGoal = processingOrder.group.goal_points.find((x) => JSON.stringify(x) === JSON.stringify(this.currentGoal));
                // console.log("arrived goal", targetGoal);
                if (targetGoal) {
                    targetGoal.status = 1;
                    this.disableSetGoal = false;
                    if (processingOrder.group.goal_points.filter((x) => x.status === 0).length === 0) {
                        // 訂單已完成
                        this.store.dispatch(setUpdatePath(true));
                        processingOrder.order.state = "end";
                        // console.log("訂單已完成");
                    }
                    this.store.dispatch(setOrders(orderCopy));
                }
                this.isSettingArrivedGoal = false;
            } else {
                // console.log("ProcessingOrder不存在", orderCopy);
                debugger;
            }
        }
    };

    setGoal = (goalPoint) => {
        // console.log("setGoal - disableSetGoal", this.disableSetGoal);
        if (!this.disableSetGoal && goalPoint) {
            // console.log("準備set goal", goalPoint);
            this.disableSetGoal = true;
            this.ros.clearRoute().then(() => {
                const data = {
                    header: {
                        frame_id: "map",
                    },
                    option: {
                        allow_goal_modification: false,
                    },
                    ...goalPoint.goalData,
                };
                this.ros.setRoutePoints(data).then((res) => {
                    setTimeout(() => {
                        this.store.dispatch(setUpdatePath(true));
                        this.store.dispatch(setCurrentGoal(goalPoint));
                        // this.ros.changeToAuto();
                    }, 500);
                });
            });
        }
    };
}

const OrderDispatchInstance = new OrderDispatch();

export default OrderDispatchInstance;
