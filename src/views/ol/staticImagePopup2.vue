<template>
  <div :id="id" class="row_nw_fs_center panel_container">
    <div class="row_nw_fs_center tag_icon"></div>
    <div class="row_nw_fs_center close_icon" @click="colseHandle">
      <img class="close_icon_show" src="" />
    </div>
    <div class="col_nw_sb_fs info_box">
      <div class="row_nw_fs_center info_label"> {{ customT("name") }}{{ `： ${vNodeData.name}` }} </div>
      <div class="row_nw_fs_center info_label"> {{ customT("longitude") }}{{ `： ${vNodeData.longitude}` }} </div>
      <div class="row_nw_fs_center info_label"> {{ customT("latitude") }}{{ `： ${vNodeData.latitude}` }} </div>
      <div class="row_nw_fs_center info_label"> {{ customT("satellite") }}{{ `： ${vNodeData.satellite}` }} </div>
      <div class="row_nw_fs_center info_label"> {{ customT("imaging") }}{{ `： ${countdownTime}` }} </div>
      <div class="row_nw_fs_center info_label"> {{ customT("测试") }}{{ `：数据更新成功` }} </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, onMounted } from "vue";

export default defineComponent({
  name: "StaticImagePopup",
  props: {
    id: {
      type: String,
      default: "001",
    },
    customT: {
      type: Function,
      default: (name: string) => name,
    },
    destory: {
      type: Function,
      default: () => {},
    },
    vNodeData: {
      type: Object,
      default() {
        return {
          name: "我是VueNode标题",
          longitude: "149.757575E",
          latitude: "30.435657N",
          satellite: "888",
          time: "2023-07-16 12:00:00",
          x: 180,
          y: 1620,
        };
      },
    },
  },
  setup(props, _) {
    const countdownTime = ref(props!.vNodeData.time);

    function countDownTimerFunc(futrue: any = null, ymdSplit = "-", hmsSplit = ":") {
      if (futrue) {
        let now = new Date();
        let futrueTime = new Date(futrue);
        let diffTime = futrueTime.getTime() - now.getTime();
        if (diffTime < 0 || isNaN(diffTime)) {
          return {
            isCount: false,
            time: futrue,
          };
        } else {
          let nextTime = futrueTime.getTime() - 1000;
          futrueTime = new Date(nextTime);
          const yearStr = "" + futrueTime.getFullYear();
          const monthStr = ("" + (futrueTime.getMonth() + 1)).padStart(2, "0");
          const dateStr = ("" + futrueTime.getDate()).padStart(2, "0");

          const hourStr = ("" + futrueTime.getHours()).padStart(2, "0");
          const minutesStr = ("" + futrueTime.getMinutes()).padStart(2, "0");
          const secondsStr = ("" + futrueTime.getSeconds()).padStart(2, "0");

          return {
            isCount: true,
            time: `${yearStr}${ymdSplit}${monthStr}${ymdSplit}${dateStr} ${hourStr}${hmsSplit}${minutesStr}${hmsSplit}${secondsStr}`,
          };
        }
      } else {
        return {
          isCount: false,
          time: futrue,
        };
      }
    }

    let countdownTimer: number | null = null;
    function clearCountdownTimer() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    }

    function changeCountdownTime() {
      clearCountdownTimer();
      countdownTimer = setInterval(() => {
        // console.log("count down")
        setCountdownTime();
      }, 1000);
    }

    function setCountdownTime() {
      let { isCount, time } = countDownTimerFunc(countdownTime.value);
      if (isCount) {
        countdownTime.value = time;
      } else {
        clearCountdownTimer();
      }
    }

    onMounted(() => {
      changeCountdownTime();
    });

    onUnmounted(() => {
      clearCountdownTimer();
    });

    const colseHandle = () => {
      props && props!.destory();
    };

    return {
      countdownTime,
      colseHandle,
    };
  },
});
</script>

<style scoped lang="scss">
.row_nw_fs_center {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
}

.col_nw_sb_fs {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
}

.panel_container {
  position: absolute;
  width: auto;
  min-width: 350px;
  height: auto;
  background: rgba(0, 13, 33, 0.75);
  border: 1px solid #ff7700;
  border-radius: 0.25rem;
  z-index: 2;
}

.tag_icon {
  position: absolute;
  width: 0.375rem;
  height: 0.375rem;
  top: 0.5rem;
  left: 0.5rem;
  background: #ffffff;
  border: 1px solid #ff7700;
  border-radius: 50%;
  cursor: pointer;
}

.close_icon {
  position: absolute;
  width: 1rem;
  height: 1rem;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.375rem;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.close_icon_show {
  width: 0.5rem;
  height: 0.5rem;
}

.info_box {
  width: max-content;
  height: auto;
  margin: 0.875rem 1.375rem;
}

.info_label {
  width: max-content;
  height: 1.25rem;
  font-size: 0.64rem;
  font-family: Source Han Sans CN;
  font-weight: 300;
  color: rgba(255, 255, 255, 1);
}
</style>
