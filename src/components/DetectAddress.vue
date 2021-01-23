<template>
  <div class="autocomplete">
    <input
      class="form-control-sm input-result"
      type="text"
      :placeholder="placeholder"
      @input="handleSearchAddress"
      v-model="textAddress"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
      @click="handleClickInput"
    />
    <ul
      v-show="isOpen && listDetectAddress && listDetectAddress.length > 0"
      ref="scrollContainer"
      class="autocomplete-results"
    >
      <li class="loading" v-if="isLoading">Đang xử lí, vui lòng đợi...</li>
      <li
        v-else
        ref="options"
        v-for="(item, index) in listDetectAddress"
        :key="index"
        @click="setResult(item)"
        class="autocomplete-result"
        :class="{ 'is-active': index === arrowCounter }"
        :title="item.address_name"
      >
        {{ item.address_name }}
      </li>
    </ul>
  </div>
</template>

<script>
import Restful from "@/services/resful.js";

import { APICMS } from "@/services/constant.js";
export default {
  props: ["store_token", "isAsync", "placeholder", "streetOrderEdit"],
  data() {
    return {
      isOpen: false,
      isLoading: false,
      arrowCounter: 0,
      detectAddress: "",
      timer: "",
      textAddress: "",
      address_id: "",
      listDetectAddress: "",
    };
  },

  methods: {
    handleSearchAddress() {
      if (this.textAddress) {
        this.$emit("text-address", this.textAddress);
      }
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.handleDetectAddress();
      }, 500);
    },
    async handleDetectAddress() {
      let path = `${APICMS}/v1/selling-page/locations/detect_address`;
      let headers = { Authorization: this.store_token };
      let address = this.textAddress;
      if (!address) return console.log("Error ::: handleDetectAddress");

      let listAddress = await Restful.get(path, { address }, headers);

      if (listAddress && listAddress.data && listAddress.data.data) {
        this.listDetectAddress = listAddress.data.data;
        this.isOpen = true;
      }
    },
    async getAddressFromDetect(address_id) {
      let path = `${APICMS}/v1/selling-page/locations/get_address`;
      let headers = { Authorization: this.store_token };
      if (!address_id) return console.log("Error ::: getAddressFromDetect");

      let getAddress = await Restful.get(path, { address_id }, headers);
      if (getAddress && getAddress.data && getAddress.data.data) {
        let house_number = getAddress.data.data.house_number;
        let street = getAddress.data.data.street;
        this.$emit("data-output", getAddress.data.data);
        this.textAddress = "";
        if (house_number) {
          this.textAddress += " " + house_number.name;
        }
        if (street) {
          this.textAddress += " " + street.name;
        }
      }
      console.log("getAddress", getAddress);
    },
    setResult(item) {
      this.getAddressFromDetect(item.address_id);
      // this.textAddress = item.address_name;
      this.isOpen = false;
    },
    onEnter() {
      if (!this.listDetectAddress || !this.listDetectAddress.length) return;
      if (this.listDetectAddress[this.arrowCounter]) {
        let address = this.listDetectAddress[this.arrowCounter];
        this.getAddressFromDetect(address.address_id);
        // this.textAddress = address.address_name;
        this.isOpen = false;
        this.arrowCounter = -1;
        console.log("onEnter");
      }
    },
    onArrowDown(evt) {
      event.preventDefault();
      if (this.arrowCounter < this.listDetectAddress.length) {
        this.isOpen = true;
        this.arrowCounter = this.arrowCounter + 1;
        this.fixScrolling();
      }
    },
    onArrowUp(event) {
      event.preventDefault();
      if (this.arrowCounter > 0) {
        this.isOpen = true;
        this.arrowCounter = this.arrowCounter - 1;
        this.fixScrolling();
      }
    },

    fixScrolling() {
      let liH = "";
      if (this.$refs.options && this.$refs.options[this.arrowCounter])
        liH = this.$refs.options[this.arrowCounter].clientHeight;
      if (this.$refs.scrollContainer)
        this.$refs.scrollContainer.scrollTop = liH * this.arrowCounter;
    },
    handleClickInput() {
      this.isOpen = !this.isOpen;
      console.log("listDetectAddress", this.listDetectAddress);
      //   this.filterResults();
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
  },
  watch: {
    streetOrderEdit: function (newVal) {
      if (newVal) {
        this.textAddress = newVal;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};

//WardName
</script>

<style lang="scss" scoped>
@mixin imageSelect {
  background: url(../assets/arrow.svg) no-repeat right #fff !important;
  background-position-x: 98% !important;
  background-size: 20px;
}
$colorHover: #dfe1e4;
* {
  font-size: 0.9rem;
  box-sizing: border-box;
}
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background-color: rgb(148, 148, 148);
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.autocomplete {
  position: relative;
  .input-result {
    @include imageSelect;
    width: 100%;
    &:focus {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
      background: #eee;
    }
  }
  .autocomplete-results {
    background: #fff;
    position: absolute;
    z-index: 3;
    padding: 0;
    margin: 0;
    border: 1px solid #eeeeee;
    // border-radius: 1rem;
    max-height: 150px;
    overflow-y: scroll;
    width: 100%;
    .autocomplete-result {
      list-style: none;
      text-align: left;
      padding: 4px 2px 0px 10px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        background-color: $colorHover;
        transform: scale(1.05);
        -webkit-transform: scale(1.05);
        transition: transform 0.15s, background 0.15s;
        width: 97%;
      }
    }
  }
}
.autocomplete-result.is-active {
  background-color: #eeeeee;
  color: #000000;
  width: 97%;
  transform: scale(1.05);
}
</style>