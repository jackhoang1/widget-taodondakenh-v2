<template>
  <div class="autocomplete">
    <input
      readonly="readonly"
      class="form-control-sm input-result"
      type="text"
      :placeholder="placeholder"
      @input="onChange"
      v-model="result"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="handleClickInput"
      @click="handleClickInput"
      @change="onChange()"
    />
    <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results">
      <input
        id=""
        class="input-search form-control-sm"
        ref="input_search"
        type="text"
        autocomplete="off"
        v-model="search"
        @input="onChange"
        @change="onChange()"
      />
      <li class="loading" v-if="isLoading">Loading results...</li>
      <li
        v-else
        v-for="(result, i) in results"
        :key="i"
        @click="
          setResult(result);
          onChange();
          if (getData) {
            getData();
          }
        "
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
      >
        {{ result[prop_name] }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: [
    "list_data_input",
    "isAsync",
    "placeholder",
    "getData",
    "prop_name",
    "changeInput",
    "clearInput",
    "watch_data",
  ],
  data() {
    return {
      isOpen: false,
      results: [],
      result: "",
      search: "",
      data_output: "",
      isLoading: false,
      arrowCounter: 0,
    };
  },

  methods: {
    onChange() {
      if (!this.list_data_input) return;
      // Let's warn the parent that a change was made
      this.$emit("data_output", this.data_output);
      if (this.changeInput) {
        this.changeInput();
      }
      if (this.clearInput) {
        this.clearInput();
      }
      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let's  our flat array
        this.filterResults();
        // this.isOpen = true;
      }
    },
    filterResults() {
      if (!this.list_data_input) return;
      // first uncapitalize all the things
      this.results = this.list_data_input.filter((item) => {
        return (
          this.handleSlug(item[this.prop_name]).indexOf(
            this.handleSlug(this.search) || ""
          ) > -1
        );
      });
    },
    setResult(result) {
      //   this.search = result[this.prop_name];
      this.result = result[this.prop_name];
      this.data_output = result;
      this.isOpen = false;
    },
    onArrowDown(evt) {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      if (!this.search) return;
      this.search = this.results[this.arrowCounter][this.prop_name];
      this.result = this.results[this.arrowCounter][this.prop_name];
      this.data_output = this.results[this.arrowCounter];
      this.onChange();
      if (this.getData != false) {
        this.getData();
      }
      this.isOpen = false;
      this.arrowCounter = -1;
    },
    handleClickInput() {
      this.isOpen = !this.isOpen;
      this.search = "";
      this.filterResults();
      if (this.$refs.input_search) {
        setTimeout(() => {
          this.$refs.input_search.focus();
        }, 0);
      }
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    handleSlug(string) {
      if (string) {
        let slug = string.toLowerCase();
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
        slug = slug.replace(/đ/gi, "d");
        return slug;
      }
      return false;
    },
  },
  watch: {
    list_data_input: function (val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    },
    watch_data: function (val, oldValue) {
      // console.log("what data val", val);
      // console.log("what data oldValue", oldValue);
      this.result = "";
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
    max-height: 200px;
    overflow-y: auto;
    width: 100%;
    .input-search {
      width: 90%;
      margin: 10px 5% 5px;
      background-color: #fff;
      outline: 0;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    }
    .autocomplete-result {
      list-style: none;
      text-align: left;
      padding: 4px 2px 0px 10px;
      cursor: pointer;
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
// .autocomplete-result.is-active {
//   background-color: #007bff;
//   color: white;
//   width: 97%;
//   transform: scale(1.05);
// }
</style>