(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/order/order"],{

/***/ 263:
/*!************************************************************!*\
  !*** D:/陪诊小程序/e-/main.js?{"page":"pages%2Forder%2Forder"} ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
__webpack_require__(/*! @dcloudio/vue-cli-plugin-uni/packages/uni-cloud/dist/index.js */ 27);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _order = _interopRequireDefault(__webpack_require__(/*! ./pages/order/order.vue */ 264));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_order.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 264:
/*!*****************************************!*\
  !*** D:/陪诊小程序/e-/pages/order/order.vue ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./order.vue?vue&type=template&id=127632e4&scoped=true& */ 265);
/* harmony import */ var _order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./order.vue?vue&type=script&lang=js& */ 267);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./order.vue?vue&type=style&index=0&id=127632e4&scoped=true&lang=css& */ 269);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 44);

var renderjs





/* normalize component */

var component = Object(_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "127632e4",
  null,
  false,
  _order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/order/order.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 265:
/*!************************************************************************************!*\
  !*** D:/陪诊小程序/e-/pages/order/order.vue?vue&type=template&id=127632e4&scoped=true& ***!
  \************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./order.vue?vue&type=template&id=127632e4&scoped=true& */ 266);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_template_id_127632e4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 266:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/陪诊小程序/e-/pages/order/order.vue?vue&type=template&id=127632e4&scoped=true& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    customNav: function () {
      return __webpack_require__.e(/*! import() | components/custom-nav/custom-nav */ "components/custom-nav/custom-nav").then(__webpack_require__.bind(null, /*! @/components/custom-nav/custom-nav.vue */ 529))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var l0 = _vm.__map(_vm.patientFeatures, function (item, __i0__) {
    var $orig = _vm.__get_orig(item)
    var g0 = _vm.selectedCheckboxes.includes(item.value)
    return {
      $orig: $orig,
      g0: g0,
    }
  })
  var l1 = _vm.__map(_vm.communicationNeeds, function (item, __i1__) {
    var $orig = _vm.__get_orig(item)
    var g1 = _vm.selectedCheckboxes.includes(item.value)
    return {
      $orig: $orig,
      g1: g1,
    }
  })
  var l2 = _vm.__map(_vm.doctorPreferences, function (item, __i2__) {
    var $orig = _vm.__get_orig(item)
    var g2 = _vm.selectedCheckboxes.includes(item.value)
    return {
      $orig: $orig,
      g2: g2,
    }
  })
  var g3 = _vm.customRequirements.length
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l0: l0,
        l1: l1,
        l2: l2,
        g3: g3,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 267:
/*!******************************************************************!*\
  !*** D:/陪诊小程序/e-/pages/order/order.vue?vue&type=script&lang=js& ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./order.vue?vue&type=script&lang=js& */ 268);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 268:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/陪诊小程序/e-/pages/order/order.vue?vue&type=script&lang=js& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _components$data$onSh;
var PaymentComponent = function PaymentComponent() {
  __webpack_require__.e(/*! require.ensure | components/PaymentComponent */ "components/PaymentComponent").then((function () {
    return resolve(__webpack_require__(/*! @/components/PaymentComponent.vue */ 672));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var ServiceNoticePopup = function ServiceNoticePopup() {
  __webpack_require__.e(/*! require.ensure | components/service-notice-popup */ "components/service-notice-popup").then((function () {
    return resolve(__webpack_require__(/*! @/components/service-notice-popup.vue */ 679));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = (_components$data$onSh = {
  components: {
    ServiceNoticePopup: ServiceNoticePopup,
    PaymentComponent: PaymentComponent
  },
  data: function data() {
    return {
      navHeight: 0,
      // 添加导航栏高度存储
      pageTitle: '服务信息',
      scrollTop: 0,
      // 选择科室
      selectedDepartment: null,
      // 就诊人特点&需求
      selectedCheckboxes: [],
      // 病例照片
      photoList: [],
      // 最多照片数
      maxPhotos: 15,
      // 每次最多上传多少张照片
      maxPerUpload: 9,
      // 照片尺寸
      maxSize: 5 * 1024 * 1024,
      // 是否展示日期选择弹窗
      showPicker: false,
      dateList: [],
      timeList: [],
      selectedDateIndex: 0,
      selectedTimeIndex: -1,
      selectedDateTime: '',
      selectedTime: null,
      selectedPatientName: '',
      selectedPatientPhone: '',
      selectedDoctorName: '',
      selectDoctorId: '',
      selectedHospital: '',
      selectAddress: ' ',
      // 服务信息
      serviceData: {},
      service_price: '',
      service_id: '',
      include_transport: ' ',
      storageTimestamp: 0,
      STORAGE_KEY: 'order_form_data',
      STORAGE_EXPIRE: 30 * 60 * 1000,
      // 就诊人特点选项
      patientFeatures: [{
        value: 'halfSelf',
        label: '半自理'
      }, {
        value: 'noSelf',
        label: '无法自理'
      }, {
        value: 'family',
        label: '有家属陪同'
      }],
      // 沟通需求选项
      communicationNeeds: [{
        value: 'common',
        label: '普通话沟通'
      }],
      // 陪诊师偏好选项
      doctorPreferences: [{
        value: 'male',
        label: '男陪诊师'
      }, {
        value: 'female',
        label: '女陪诊师'
      }],
      // 自定义需求描述
      customRequirements: '',
      // 表单验证相关
      missingRequiredFields: false,
      // 表单验证状态
      formValid: false,
      fieldErrors: {
        patient: false,
        hospital: false,
        datetime: false,
        address: false
      },
      missingOptionalFields: []
    };
  },
  onShow: function onShow() {
    // 恢复服务数据
    var savedService = uni.getStorageSync('current_service');
    if (savedService) {
      console.log("获取缓存的服务数据", savedService);
      this.serviceData = savedService;
      this.service_price = savedService.service_price;
    }
    this.loadDoctorInfo();
    this.loadPatientInfo();
    this.loadSavedPhotos();
    this.restoreFormData();
  },
  onLoad: function onLoad(options) {
    var _this$serviceData, _this$serviceData2, _this$serviceData3;
    var systemInfo = uni.getSystemInfoSync();
    this.navHeight = systemInfo.statusBarHeight + 44;
    this.loadSavedPhotos();
    this.initDateTimeList();

    // 解析并存储服务数据
    var serviceDataString = options.service;
    if (serviceDataString) {
      try {
        this.serviceData = JSON.parse(decodeURIComponent(serviceDataString));
        console.log("初始服务数据:", this.serviceData);
        this.service_price = this.serviceData.service_price;
        // 立即存储服务数据
        uni.setStorageSync('current_service', this.serviceData);
      } catch (error) {
        console.error('解析服务数据失败:', error);
      }
    }
    this.include_transport = ((_this$serviceData = this.serviceData) === null || _this$serviceData === void 0 ? void 0 : _this$serviceData.include_transport) || '';
    this.service_price = ((_this$serviceData2 = this.serviceData) === null || _this$serviceData2 === void 0 ? void 0 : _this$serviceData2.service_price) || '';
    this.service_id = ((_this$serviceData3 = this.serviceData) === null || _this$serviceData3 === void 0 ? void 0 : _this$serviceData3.service_id) || '';
    this.loadPatientInfo();
    this.loadDoctorInfo();
    var address = uni.getStorageSync('selectedAddress');
    console.log("获取地址:", address);
    if (address) {
      this.selectAddress = (address.district || '') + (address.detail || '');
    }
  },
  computed: {
    // 整合所有订单信息
    orderInfo: function orderInfo() {
      return {
        patient_phone: this.selectedPatientPhone,
        patient_name: this.selectedPatientName,
        hospital: this.selectedHospital,
        service_time: this.selectedDateTime,
        doctor_name: this.selectedDoctorName,
        doctor_id: this.selectDoctorId,
        department: this.selectedDepartment,
        materials: this.photoList,
        requirements: this.selectedCheckboxes,
        custom_requirements: this.customRequirements,
        include_transport: this.include_transport,
        service_id: this.serviceData.service_id,
        service_name: this.serviceData.service_name || '自定义医疗陪诊服务',
        service_desc: this.serviceData.service_desc || '根据您的需求提供专业陪诊服务'
      };
    }
  }
}, (0, _defineProperty2.default)(_components$data$onSh, "onShow", function onShow() {
  this.loadDoctorInfo();
  this.loadPatientInfo();
  this.loadSavedPhotos();
  this.restoreFormData();
}), (0, _defineProperty2.default)(_components$data$onSh, "onHide", function onHide() {
  this.saveFormData();
}), (0, _defineProperty2.default)(_components$data$onSh, "onUnload", function onUnload() {}), (0, _defineProperty2.default)(_components$data$onSh, "onBackPress", function onBackPress() {
  var _this = this;
  if (this.hasFormData()) {
    uni.showModal({
      title: '提示',
      content: '您有未提交的订单数据，是否保存？',
      success: function success(res) {
        if (res.confirm) {
          _this.saveFormData();
          uni.navigateBack();
        } else if (res.cancel) {
          _this.clearFormData();
          uni.navigateBack();
        }
      }
    });
    return true;
  }
}), (0, _defineProperty2.default)(_components$data$onSh, "mounted", function mounted() {
  console.log('支付组件实例:', this.$refs.paymentComponent);
  if (!this.$refs.paymentComponent) {
    console.error('未获取到支付组件实例，请检查ref名称是否正确');
  }
}), (0, _defineProperty2.default)(_components$data$onSh, "methods", {
  //监视页面滚动情况
  handleScroll: function handleScroll(e) {
    var _this2 = this;
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(function () {
      _this2.scrollTop = e.detail.scrollTop;
    }, 16); // 约60fps
  },
  // 提交订单处理函数
  handleSubmitOrder: function handleSubmitOrder() {
    var _this3 = this;
    console.log('提交订单事件触发，开始验证表单');
    this.validateForm().then(function (valid) {
      if (valid) {
        _this3.openNoticePopup(); // 显示服务须知
      } else {
        uni.showToast({
          title: '请完成必填信息',
          icon: 'none'
        });
      }
    });
  },
  // 表单验证方法
  validateForm: function validateForm() {
    var _this4 = this;
    return new Promise(function (resolve) {
      // 重置验证状态
      _this4.fieldErrors = {
        patient: !_this4.selectedPatientName,
        hospital: !_this4.selectedHospital,
        datetime: !_this4.selectedDateTime,
        address: _this4.include_transport && (!_this4.selectAddress || _this4.selectAddress.trim() === '')
      };

      // 检查必填字段
      var requiredFields = ['patient', 'hospital', 'datetime'];
      var missingRequired = requiredFields.some(function (field) {
        return _this4.fieldErrors[field];
      });
      if (missingRequired) {
        // 收集错误字段并显示提示
        var errorFields = requiredFields.filter(function (field) {
          return _this4.fieldErrors[field];
        }).map(function (field) {
          switch (field) {
            case 'patient':
              return '就诊人';
            case 'hospital':
              return '服务医院';
            case 'datetime':
              return '服务时间';
            case 'address':
              return '接送地点';
            default:
              return field;
          }
        });
        uni.showToast({
          title: '请填写以下必填信息：' + errorFields.join('、'),
          icon: 'none'
        });
        resolve(false);
        return;
      }

      // 选填字段检查
      _this4.missingOptionalFields = [];
      var optionalFields = [{
        value: _this4.selectedDepartment,
        name: '科室'
      }, {
        value: _this4.selectedCheckboxes.length > 0,
        name: '就诊人特点及陪诊需求'
      }, {
        value: _this4.photoList.length > 0,
        name: '上传材料'
      }, {
        value: _this4.customRequirements,
        name: '其他特殊需求描述'
      }];
      var missingOptional = optionalFields.filter(function (field) {
        if (typeof field.value === 'string') {
          return !field.value || field.value.trim() === '';
        }
        return !field.value;
      });
      if (missingOptional.length > 0) {
        _this4.missingOptionalFields = missingOptional.map(function (field) {
          return field.name;
        });
        // 显示选填字段提示
        uni.showModal({
          title: '提示',
          content: "\u60A8\u5C1A\u672A\u586B\u5199\u4EE5\u4E0B\u9009\u586B\u4FE1\u606F\uFF1A".concat(missingOptional.map(function (field) {
            return field.name;
          }).join('、'), "\uFF0C\u662F\u5426\u7EE7\u7EED\u63D0\u4EA4\uFF1F"),
          success: function success(res) {
            resolve(res.confirm);
          },
          fail: function fail() {
            return resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  },
  openNoticePopup: function openNoticePopup() {
    this.$refs.serviceNoticePopup.show();
  },
  onNoticeConfirm: function onNoticeConfirm() {
    console.log('服务须知已确认，开始创建订单');
    // 服务须知确认后，调用组件的提交方法
    this.$refs.paymentComponent.submitOrderAfterValidation();
  },
  loadDoctorInfo: function loadDoctorInfo() {
    var doctor = uni.getStorageSync('selectedDoctor');
    console.log("获取医生信息：" + doctor.user_id);
    if (doctor) {
      this.selectDoctorId = doctor.user_id;
      this.selectedDoctorName = doctor.name || '';
    }
  },
  loadPatientInfo: function loadPatientInfo() {
    var patient = uni.getStorageSync('selectedPatient');
    console.log(patient);
    if (patient) {
      this.selectedPatientPhone = patient.phone;
      this.selectedPatientName = patient.name || '';
      console.log("病人是" + this.selectedPatientName + "电话为" + this.selectedPatientPhone);
    }
  },
  goToSelectHospitals: function goToSelectHospitals() {
    var _this5 = this;
    uni.navigateTo({
      url: '/pages/more/more?from=order',
      success: function success() {
        uni.$once('select-hospital', function (hospital) {
          _this5.selectedHospital = hospital.name;
        });
      }
    });
  },
  hasFormData: function hasFormData() {
    return this.selectedDepartment || this.selectedCheckboxes.length > 0 || this.photoList.length > 0 || this.selectedDateTime;
  },
  saveFormData: function saveFormData() {
    var formData = {
      selectedDepartment: this.selectedDepartment,
      selectedCheckboxes: this.selectedCheckboxes,
      photoList: this.photoList,
      selectedDateTime: this.selectedDateTime,
      selectedPatientName: this.selectedPatientName,
      selectedDoctorName: this.selectedDoctorName,
      selectAddress: this.selectAddress,
      customRequirements: this.customRequirements,
      serviceData: this.serviceData,
      // 新增服务数据保存
      service_price: this.service_price,
      // 新增价格保存
      timestamp: new Date().getTime()
    };
    uni.setStorageSync(this.STORAGE_KEY, formData);
  },
  restoreFormData: function restoreFormData() {
    var savedData = uni.getStorageSync(this.STORAGE_KEY);
    if (savedData && !this.isDataExpired(savedData.timestamp)) {
      // 恢复表单数据
      if (!this.selectedDepartment) this.selectedDepartment = savedData.selectedDepartment;
      if (!this.selectedCheckboxes) this.selectedCheckboxes = savedData.selectedCheckboxes;
      if (!this.photoList) this.photoList = savedData.photoList;
      if (!this.selectedDateTime) this.selectedDateTime = savedData.selectedDateTime;
      if (!this.selectedPatientName) this.selectedPatientName = savedData.selectedPatientName;
      if (!this.selectedDoctorName) this.selectedDoctorName = savedData.selectedDoctorName;
      if (!this.selectAddress) this.selectAddress = savedData.selectAddress;
      if (!this.customRequirements) this.customRequirements = savedData.customRequirements || '';

      // 恢复服务数据
      if (savedData.serviceData) {
        this.serviceData = savedData.serviceData;
        this.service_price = savedData.service_price;
      }
    } else {
      uni.removeStorageSync(this.STORAGE_KEY);
    }
  },
  isDataExpired: function isDataExpired(timestamp) {
    return new Date().getTime() - timestamp > this.STORAGE_EXPIRE;
  },
  clearFormData: function clearFormData() {
    this.selectedDepartment = null;
    this.selectedCheckboxes = [];
    this.photoList = [];
    this.selectedDateTime = '';
    this.selectedPatientName = '';
    this.selectedPatientPhone = '';
    this.selectedDoctorName = '';
    this.selectDoctorId = '';
    this.selectedHospital = '';
    this.selectAddress = '';
    this.customRequirements = '';

    // 清除本地存储的表单数据
    uni.removeStorageSync(this.STORAGE_KEY);
    // 清除图片缓存
    uni.removeStorageSync('photoList');
    // 清除地址缓存
    uni.removeStorageSync('selectedAddress');
    // 清除医生缓存
    uni.removeStorageSync('selectedDoctor');
    // 清除就诊人缓存
    uni.removeStorageSync('selectedPatient');
  },
  goToDepartmentPage: function goToDepartmentPage() {
    uni.navigateTo({
      url: '/pages/department/department?selected=' + (this.selectedDepartment || '')
    });
  },
  selectDepartment: function selectDepartment(event) {
    this.selectedDepartment = event.currentTarget.dataset.department;
  },
  toggleCheckbox: function toggleCheckbox(event) {
    var value = event.currentTarget.dataset.value;
    this.selectedCheckboxes.includes(value) ? this.selectedCheckboxes = this.selectedCheckboxes.filter(function (item) {
      return item !== value;
    }) : this.selectedCheckboxes.push(value);
  },
  loadSavedPhotos: function loadSavedPhotos() {
    try {
      var savedPhotoList = wx.getStorageSync('photoList');
      if (savedPhotoList) this.photoList = savedPhotoList;
    } catch (e) {
      console.error("Error loading saved photos:", e);
    }
  },
  chooseImage: function chooseImage() {
    var _this6 = this;
    var remaining = this.maxPhotos - this.photoList.length;
    if (remaining <= 0) {
      wx.showToast({
        title: '最多只能上传15张图片',
        icon: 'none'
      });
      return;
    }
    var count = Math.min(this.maxPerUpload, remaining);
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function success(res) {
        res.tempFilePaths.forEach(function (filePath) {
          return _this6.checkFileSize(filePath);
        });
      }
    });
  },
  checkFileSize: function checkFileSize(filePath) {
    var _this7 = this;
    var fs = wx.getFileSystemManager();
    fs.getFileInfo({
      filePath: filePath,
      success: function success(res) {
        res.size > _this7.maxSize ? wx.showToast({
          title: '图片大小不能超过5MB',
          icon: 'none'
        }) : _this7.uploadImg(filePath);
      },
      fail: function fail(err) {
        console.error("Failed to get file size:", err);
        wx.showToast({
          title: '无法获取文件大小',
          icon: 'none'
        });
      }
    });
  },
  uploadImg: function uploadImg(imgSrc) {
    var _this8 = this;
    wx.showLoading({
      title: "上传中..."
    });
    var fs = wx.getFileSystemManager();
    fs.saveFile({
      tempFilePath: imgSrc,
      success: function success(res) {
        if (res.savedFilePath) {
          _this8.photoList.push(res.savedFilePath);
          wx.setStorageSync('photoList', _this8.photoList);
          wx.hideLoading();
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      },
      fail: function fail(err) {
        console.error("Save failed:", err);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  },
  deletePhoto: function deletePhoto(e) {
    var index = e.currentTarget.dataset.index;
    this.photoList.splice(index, 1);
    wx.setStorageSync('photoList', this.photoList);
    wx.showToast({
      title: '图片已删除',
      icon: 'success'
    });
  },
  initDateTimeList: function initDateTimeList() {
    var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    this.dateList = Array.from({
      length: 7
    }, function (_, i) {
      var date = new Date();
      date.setDate(date.getDate() + i);
      return {
        day: "".concat(date.getMonth() + 1, "\u6708").concat(date.getDate(), "\u65E5"),
        week: days[date.getDay()]
      };
    });
    this.timeList = [];
    for (var hour = 8; hour <= 18; hour++) {
      this.timeList.push("".concat(hour, ":00"));
      if (hour < 18) this.timeList.push("".concat(hour, ":30"));
    }
  },
  showDateTimePicker: function showDateTimePicker() {
    this.showPicker = true;
  },
  hideDateTimePicker: function hideDateTimePicker() {
    this.showPicker = false;
  },
  selectDate: function selectDate(index) {
    this.selectedDateIndex = index;
  },
  selectTime: function selectTime(index) {
    this.selectedTimeIndex = index;
  },
  confirmDateTime: function confirmDateTime() {
    if (this.selectedTimeIndex === -1) {
      uni.showToast({
        title: '请选择时间',
        icon: 'none'
      });
      return;
    }
    var date = this.dateList[this.selectedDateIndex];
    var time = this.timeList[this.selectedTimeIndex];
    this.selectedDateTime = "".concat(date.day, " ").concat(date.week, " ").concat(time);
    // this.selectedTime={date,time}
    this.hideDateTimePicker();
  },
  goToPatientManagement: function goToPatientManagement() {
    // 跳转前保存所有数据
    this.saveFormData();
    uni.setStorageSync('current_service', this.serviceData);
    uni.navigateTo({
      url: '/pages/patientManagement/patientManagement'
    });
  },
  goToDoctorList: function goToDoctorList() {
    if (this.selectedDateTime == '') {
      uni.showToast({
        title: '请先选择时间',
        icon: 'none'
      });
      return;
    }
    this.saveFormData();
    uni.setStorageSync('current_service', this.serviceData);
    var selectedTime = this.selectedDateTime;
    uni.navigateTo({
      url: "/pages/doctorlist/doctorlist?from=order&selectedTime=".concat(selectedTime)
    });
  },
  goToAddressList: function goToAddressList() {
    uni.navigateTo({
      url: '/pages/myAddress/myAddress'
    });
  },
  // 处理自定义需求输入
  onCustomRequirementsInput: function onCustomRequirementsInput(e) {
    this.customRequirements = e.detail.value;
  }
}), _components$data$onSh);
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 269:
/*!**************************************************************************************************!*\
  !*** D:/陪诊小程序/e-/pages/order/order.vue?vue&type=style&index=0&id=127632e4&scoped=true&lang=css& ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../HBuilderX.4.45.2025010502/HBuilderX.4.66.2025051912/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./order.vue?vue&type=style&index=0&id=127632e4&scoped=true&lang=css& */ 270);
/* harmony import */ var _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_HBuilderX_4_45_2025010502_HBuilderX_4_66_2025051912_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_order_vue_vue_type_style_index_0_id_127632e4_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 270:
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/陪诊小程序/e-/pages/order/order.vue?vue&type=style&index=0&id=127632e4&scoped=true&lang=css& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[263,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map