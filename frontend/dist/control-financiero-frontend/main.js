"use strict";
(self["webpackChunkcontrol_financiero_frontend"] = self["webpackChunkcontrol_financiero_frontend"] || []).push([["main"],{

/***/ 92:
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppComponent: () => (/* binding */ AppComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/toolbar */ 9552);
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/sidenav */ 7049);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ 3840);
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ 4175);
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/list */ 943);
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/menu */ 1034);
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/cdk/layout */ 7912);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 6301);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _core_services_auth_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/services/auth.service */ 8010);
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/divider */ 4102);






















const _c0 = ["drawer"];
function AppComponent_div_0_button_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_button_10_Template_button_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r2);
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      const drawer_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](drawer_r3.close());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "close");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}
function AppComponent_div_0_span_47_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 24)(1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "account_circle");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const user_r5 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", user_r5.nombre, " ");
  }
}
function AppComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div")(1, "mat-sidenav-container", 4)(2, "mat-sidenav", 5, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](4, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](5, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](6, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "mat-toolbar", 6)(8, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Control Financiero");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](10, AppComponent_div_0_button_10_Template, 3, 0, "button", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](11, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "mat-nav-list")(13, "a", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_13_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.closeDrawerOnMobile());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](15, "dashboard");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17, "Dashboard");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](18, "a", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_18_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.closeDrawerOnMobile());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](19, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](20, "account_balance_wallet");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](22, "Transacciones");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](23, "a", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_23_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.closeDrawerOnMobile());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](25, "savings");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](26, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](27, "Fondos");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](28, "a", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_28_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.closeDrawerOnMobile());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](29, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](30, "assessment");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](31, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](32, "Reportes Financieros");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](33, "mat-divider");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](34, "a", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_34_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.logout());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](35, "mat-icon", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](36, "logout");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](37, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](38, "Cerrar Sesi\u00F3n");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](39, "mat-sidenav-content")(40, "mat-toolbar", 15)(41, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_button_click_41_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const drawer_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](drawer_r3.toggle());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](42, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](43, "menu");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](44, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](45, "Control Financiero");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](46, "span", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](47, AppComponent_div_0_span_47_Template, 4, 1, "span", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](48, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](49, "button", 20)(50, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](51, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](52, "mat-menu", null, 2)(54, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function AppComponent_div_0_Template_button_click_54_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r3.logout());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](55, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](56, "logout");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](57, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](58, "Cerrar Sesi\u00F3n");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](59, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](60, "router-outlet");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const userMenu_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](53);
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("mode", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](4, 6, ctx_r3.isHandset$) ? "over" : "side")("opened", !_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](5, 8, ctx_r3.isHandset$));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("role", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](6, 10, ctx_r3.isHandset$) ? "dialog" : "navigation");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](11, 12, ctx_r3.isHandset$));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](48, 14, ctx_r3.authService.currentUser$));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matMenuTriggerFor", userMenu_r6);
  }
}
function AppComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "router-outlet");
  }
}
class AppComponent {
  constructor(breakpointObserver, router, authService) {
    this.breakpointObserver = breakpointObserver;
    this.router = router;
    this.authService = authService;
    this.title = 'Control Financiero';
    this.isHandset$ = this.breakpointObserver.observe(_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__.Breakpoints.Handset).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(result => result.matches), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.shareReplay)());
  }
  ngOnInit() {
    // Verificar autenticación al iniciar
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn && !this.router.url.includes('login') && !this.router.url.includes('register')) {
        this.router.navigate(['/login']);
      }
    });
  }
  closeDrawerOnMobile() {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset && this.drawer) {
        this.drawer.close();
      }
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  static {
    this.ɵfac = function AppComponent_Factory(t) {
      return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__.BreakpointObserver), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_core_services_auth_service__WEBPACK_IMPORTED_MODULE_0__.AuthService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: AppComponent,
      selectors: [["app-root"]],
      viewQuery: function AppComponent_Query(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c0, 5);
        }
        if (rf & 2) {
          let _t;
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.drawer = _t.first);
        }
      },
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
      decls: 4,
      vars: 4,
      consts: [["loginView", ""], ["drawer", ""], ["userMenu", "matMenu"], [4, "ngIf", "ngIfElse"], [1, "sidenav-container"], ["fixedInViewport", "", 1, "sidenav", 3, "mode", "opened"], [1, "sidenav-header"], ["mat-icon-button", "", 3, "click", 4, "ngIf"], ["mat-list-item", "", "routerLink", "/dashboard", "routerLinkActive", "active-link", 3, "click"], ["matListItemIcon", ""], ["matListItemTitle", ""], ["mat-list-item", "", "routerLink", "/transacciones", "routerLinkActive", "active-link", 3, "click"], ["mat-list-item", "", "routerLink", "/fondos", "routerLinkActive", "active-link", 3, "click"], ["mat-list-item", "", "routerLink", "/reportes", "routerLinkActive", "active-link", 3, "click"], ["mat-list-item", "", 3, "click"], ["color", "primary", 1, "main-toolbar"], ["type", "button", "aria-label", "Toggle sidenav", "mat-icon-button", "", 3, "click"], [1, "app-title"], [1, "spacer"], ["class", "user-info", 4, "ngIf"], ["mat-icon-button", "", 3, "matMenuTriggerFor"], ["mat-menu-item", "", 3, "click"], [1, "main-content"], ["mat-icon-button", "", 3, "click"], [1, "user-info"]],
      template: function AppComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, AppComponent_div_0_Template, 61, 16, "div", 3);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](1, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, AppComponent_ng_template_2_Template, 1, 0, "ng-template", null, 0, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplateRefExtractor"]);
        }
        if (rf & 2) {
          const loginView_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](1, 2, ctx.authService.isLoggedIn$))("ngIfElse", loginView_r7);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_6__.AsyncPipe, _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterOutlet, _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule, _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterLink, _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterLinkActive, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_7__.MatToolbarModule, _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_7__.MatToolbar, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_8__.MatSidenavModule, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_8__.MatSidenav, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_8__.MatSidenavContainer, _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_8__.MatSidenavContent, _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__.MatIconModule, _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__.MatIcon, _angular_material_button__WEBPACK_IMPORTED_MODULE_10__.MatButtonModule, _angular_material_button__WEBPACK_IMPORTED_MODULE_10__.MatIconButton, _angular_material_list__WEBPACK_IMPORTED_MODULE_11__.MatListModule, _angular_material_list__WEBPACK_IMPORTED_MODULE_11__.MatNavList, _angular_material_list__WEBPACK_IMPORTED_MODULE_11__.MatListItem, _angular_material_list__WEBPACK_IMPORTED_MODULE_11__.MatListItemIcon, _angular_material_divider__WEBPACK_IMPORTED_MODULE_12__.MatDivider, _angular_material_list__WEBPACK_IMPORTED_MODULE_11__.MatListItemTitle, _angular_material_menu__WEBPACK_IMPORTED_MODULE_13__.MatMenuModule, _angular_material_menu__WEBPACK_IMPORTED_MODULE_13__.MatMenu, _angular_material_menu__WEBPACK_IMPORTED_MODULE_13__.MatMenuItem, _angular_material_menu__WEBPACK_IMPORTED_MODULE_13__.MatMenuTrigger],
      styles: [".sidenav-container[_ngcontent-%COMP%] {\n  height: 100vh;\n}\n\n.sidenav[_ngcontent-%COMP%] {\n  width: 260px;\n  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.24);\n}\n\n.sidenav-header[_ngcontent-%COMP%] {\n  background: #1976d2;\n  color: white;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 16px;\n}\n\n.main-toolbar[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n\n.app-title[_ngcontent-%COMP%] {\n  font-weight: 500;\n  margin-left: 8px;\n}\n\n.main-content[_ngcontent-%COMP%] {\n  padding: 20px;\n  min-height: calc(100vh - 64px);\n  background-color: #fafafa;\n}\n\n.active-link[_ngcontent-%COMP%] {\n  background-color: rgba(63, 81, 181, 0.1) !important;\n  border-right: 3px solid #3f51b5;\n}\n\n.active-link[_ngcontent-%COMP%]   .mat-list-item-icon[_ngcontent-%COMP%] {\n  color: #3f51b5;\n}\n\n.user-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 0.9em;\n  margin-right: 8px;\n}\n\n.spacer[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n}\n\nmat-nav-list[_ngcontent-%COMP%]   .mat-list-item[_ngcontent-%COMP%] {\n  border-radius: 0 25px 25px 0;\n  margin: 4px 8px 4px 0;\n  transition: all 0.3s ease;\n}\n\nmat-nav-list[_ngcontent-%COMP%]   .mat-list-item[_ngcontent-%COMP%]:hover {\n  background-color: rgba(0, 0, 0, 0.04);\n}\n\n@media (max-width: 768px) {\n  .sidenav[_ngcontent-%COMP%] {\n    width: 280px;\n  }\n  .main-content[_ngcontent-%COMP%] {\n    padding: 16px;\n    min-height: calc(100vh - 56px);\n  }\n  .user-info[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .app-title[_ngcontent-%COMP%] {\n    font-size: 1.1em;\n  }\n}\n@media (max-width: 480px) {\n  .user-info[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvYXBwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDSTtFQUNFLGFBQUE7QUFBTjs7QUFHSTtFQUNFLFlBQUE7RUFDQSx5Q0FBQTtBQUFOOztBQUdJO0VBQ0UsbUJBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxlQUFBO0FBQU47O0FBR0k7RUFDRSxnQkFBQTtFQUNBLE1BQUE7RUFDQSxhQUFBO0VBQ0Esd0NBQUE7QUFBTjs7QUFHSTtFQUNFLGdCQUFBO0VBQ0EsZ0JBQUE7QUFBTjs7QUFHSTtFQUNFLGFBQUE7RUFDQSw4QkFBQTtFQUNBLHlCQUFBO0FBQU47O0FBR0k7RUFDRSxtREFBQTtFQUNBLCtCQUFBO0FBQU47O0FBR0k7RUFDRSxjQUFBO0FBQU47O0FBR0k7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxRQUFBO0VBQ0EsZ0JBQUE7RUFDQSxpQkFBQTtBQUFOOztBQUdJO0VBQ0UsY0FBQTtBQUFOOztBQUdJO0VBQ0UsNEJBQUE7RUFDQSxxQkFBQTtFQUNBLHlCQUFBO0FBQU47O0FBR0k7RUFDRSxxQ0FBQTtBQUFOOztBQUdJO0VBQ0U7SUFDRSxZQUFBO0VBQU47RUFHSTtJQUNFLGFBQUE7SUFDQSw4QkFBQTtFQUROO0VBSUk7SUFDRSxhQUFBO0VBRk47RUFLSTtJQUNFLGdCQUFBO0VBSE47QUFDRjtBQU1JO0VBQ0U7SUFDRSxhQUFBO0VBSk47QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIlxuICAgIC5zaWRlbmF2LWNvbnRhaW5lciB7XG4gICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgIH1cbiAgICBcbiAgICAuc2lkZW5hdiB7XG4gICAgICB3aWR0aDogMjYwcHg7XG4gICAgICBib3gtc2hhZG93OiAzcHggMCA2cHggcmdiYSgwLDAsMCwuMjQpO1xuICAgIH1cbiAgICBcbiAgICAuc2lkZW5hdi1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogIzE5NzZkMjtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgcGFkZGluZzogMCAxNnB4O1xuICAgIH1cbiAgICBcbiAgICAubWFpbi10b29sYmFyIHtcbiAgICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgICB0b3A6IDA7XG4gICAgICB6LWluZGV4OiAxMDAwO1xuICAgICAgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwwLDAsLjEpO1xuICAgIH1cbiAgICBcbiAgICAuYXBwLXRpdGxlIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBtYXJnaW4tbGVmdDogOHB4O1xuICAgIH1cbiAgICBcbiAgICAubWFpbi1jb250ZW50IHtcbiAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICBtaW4taGVpZ2h0OiBjYWxjKDEwMHZoIC0gNjRweCk7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmFmYWZhO1xuICAgIH1cbiAgICBcbiAgICAuYWN0aXZlLWxpbmsge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg2MywgODEsIDE4MSwgMC4xKSAhaW1wb3J0YW50O1xuICAgICAgYm9yZGVyLXJpZ2h0OiAzcHggc29saWQgIzNmNTFiNTtcbiAgICB9XG4gICAgXG4gICAgLmFjdGl2ZS1saW5rIC5tYXQtbGlzdC1pdGVtLWljb24ge1xuICAgICAgY29sb3I6ICMzZjUxYjU7XG4gICAgfVxuXG4gICAgLnVzZXItaW5mbyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogOHB4O1xuICAgICAgZm9udC1zaXplOiAwLjllbTtcbiAgICAgIG1hcmdpbi1yaWdodDogOHB4O1xuICAgIH1cbiAgICBcbiAgICAuc3BhY2VyIHtcbiAgICAgIGZsZXg6IDEgMSBhdXRvO1xuICAgIH1cblxuICAgIG1hdC1uYXYtbGlzdCAubWF0LWxpc3QtaXRlbSB7XG4gICAgICBib3JkZXItcmFkaXVzOiAwIDI1cHggMjVweCAwO1xuICAgICAgbWFyZ2luOiA0cHggOHB4IDRweCAwO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbiAgICB9XG5cbiAgICBtYXQtbmF2LWxpc3QgLm1hdC1saXN0LWl0ZW06aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjA0KTtcbiAgICB9XG4gICAgXG4gICAgQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gICAgICAuc2lkZW5hdiB7XG4gICAgICAgIHdpZHRoOiAyODBweDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLm1haW4tY29udGVudCB7XG4gICAgICAgIHBhZGRpbmc6IDE2cHg7XG4gICAgICAgIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA1NnB4KTtcbiAgICAgIH1cblxuICAgICAgLnVzZXItaW5mbyBzcGFuIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIH1cblxuICAgICAgLmFwcC10aXRsZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMS4xZW07XG4gICAgICB9XG4gICAgfVxuXG4gICAgQG1lZGlhIChtYXgtd2lkdGg6IDQ4MHB4KSB7XG4gICAgICAudXNlci1pbmZvIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIH1cbiAgICB9XG4gICJdLCJzb3VyY2VSb290IjoiIn0= */"]
    });
  }
}

/***/ }),

/***/ 289:
/*!*******************************!*\
  !*** ./src/app/app.config.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appConfig: () => (/* binding */ appConfig)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/platform-browser/animations */ 3835);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/core */ 4646);
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/snack-bar */ 3347);
/* harmony import */ var _app_routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app.routes */ 2181);
/* harmony import */ var _core_interceptors_auth_interceptor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/interceptors/auth.interceptor */ 3622);
/* harmony import */ var _core_interceptors_error_interceptor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/interceptors/error.interceptor */ 9446);









const appConfig = {
  providers: [(0,_angular_router__WEBPACK_IMPORTED_MODULE_3__.provideRouter)(_app_routes__WEBPACK_IMPORTED_MODULE_0__.routes), (0,_angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_4__.provideAnimations)(), (0,_angular_common_http__WEBPACK_IMPORTED_MODULE_5__.provideHttpClient)((0,_angular_common_http__WEBPACK_IMPORTED_MODULE_5__.withInterceptors)([_core_interceptors_auth_interceptor__WEBPACK_IMPORTED_MODULE_1__.authInterceptor, _core_interceptors_error_interceptor__WEBPACK_IMPORTED_MODULE_2__.errorInterceptor])), (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.importProvidersFrom)(_angular_material_core__WEBPACK_IMPORTED_MODULE_7__.MatNativeDateModule, _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_8__.MatSnackBarModule)]
};

/***/ }),

/***/ 2181:
/*!*******************************!*\
  !*** ./src/app/app.routes.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   routes: () => (/* binding */ routes)
/* harmony export */ });
/* harmony import */ var _core_guards_auth_guard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/guards/auth.guard */ 4978);

const routes = [{
  path: '',
  redirectTo: '/login',
  pathMatch: 'full'
}, {
  path: 'login',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_progress-spinner_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_checkbox_mjs"), __webpack_require__.e("src_app_features_auth_login_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/auth/login.component */ 7151)).then(m => m.LoginComponent)
}, {
  path: 'register',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_progress-spinner_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_checkbox_mjs"), __webpack_require__.e("src_app_features_auth_register_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/auth/register.component */ 9123)).then(m => m.RegisterComponent)
}, {
  path: 'dashboard',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_select_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_grid-list_mjs-node_modules_angular_material_fe-847d4b"), __webpack_require__.e("default-src_app_core_services_transaccion_service_ts"), __webpack_require__.e("src_app_features_dashboard_dashboard_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/dashboard/dashboard.component */ 1626)).then(m => m.DashboardComponent),
  canActivate: [_core_guards_auth_guard__WEBPACK_IMPORTED_MODULE_0__.AuthGuard]
}, {
  path: 'transacciones',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_select_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_progress-spinner_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_chips_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_datepicker_mjs-node_modules_angular_material_f-70ccfb"), __webpack_require__.e("default-src_app_core_services_fondo_service_ts-node_modules_angular_material_fesm2022_dialog_-5177a9"), __webpack_require__.e("default-src_app_core_services_transaccion_service_ts"), __webpack_require__.e("src_app_features_transacciones_transacciones_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/transacciones/transacciones.component */ 4018)).then(m => m.TransaccionesComponent),
  canActivate: [_core_guards_auth_guard__WEBPACK_IMPORTED_MODULE_0__.AuthGuard]
}, {
  path: 'fondos',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_select_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_chips_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_grid-list_mjs-node_modules_angular_material_fe-847d4b"), __webpack_require__.e("default-src_app_core_services_fondo_service_ts-node_modules_angular_material_fesm2022_dialog_-5177a9"), __webpack_require__.e("src_app_features_fondos_fondos_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/fondos/fondos.component */ 8098)).then(m => m.FondosComponent),
  canActivate: [_core_guards_auth_guard__WEBPACK_IMPORTED_MODULE_0__.AuthGuard]
}, {
  path: 'reportes',
  loadComponent: () => Promise.all(/*! import() */[__webpack_require__.e("default-node_modules_angular_material_fesm2022_card_mjs-node_modules_angular_material_fesm202-41a46e"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_select_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_progress-spinner_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_chips_mjs"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_grid-list_mjs-node_modules_angular_material_fe-847d4b"), __webpack_require__.e("default-node_modules_angular_material_fesm2022_datepicker_mjs-node_modules_angular_material_f-70ccfb"), __webpack_require__.e("src_app_features_reportes_reportes_component_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./features/reportes/reportes.component */ 7584)).then(m => m.ReportesComponent),
  canActivate: [_core_guards_auth_guard__WEBPACK_IMPORTED_MODULE_0__.AuthGuard]
}, {
  path: '**',
  redirectTo: '/login'
}];

/***/ }),

/***/ 4978:
/*!*******************************************!*\
  !*** ./src/app/core/guards/auth.guard.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthGuard: () => (/* binding */ AuthGuard)
/* harmony export */ });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 4334);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/auth.service */ 8010);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 5072);




class AuthGuard {
  constructor(authService, router) {
    this.authService = authService;
    this.router = router;
  }
  canActivate(route, state) {
    return this.authService.isLoggedIn$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.take)(1), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.map)(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        // Redirigir a login guardando la URL original
        this.router.navigate(['/login'], {
          queryParams: {
            returnUrl: state.url
          }
        });
        return false;
      }
    }));
  }
  static {
    this.ɵfac = function AuthGuard_Factory(t) {
      return new (t || AuthGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_0__.AuthService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({
      token: AuthGuard,
      factory: AuthGuard.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 3622:
/*!*******************************************************!*\
  !*** ./src/app/core/interceptors/auth.interceptor.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   authInterceptor: () => (/* binding */ authInterceptor)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../environments/environment */ 5312);




const authInterceptor = (req, next) => {
  const router = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_angular_router__WEBPACK_IMPORTED_MODULE_2__.Router);
  let authReq = req;
  // Solo agregar el token a las peticiones a nuestra API
  if (req.url.includes(_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl)) {
    const token = localStorage.getItem('cf_auth_token');
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  return next(authReq).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
    // Solo manejar errores 401 para endpoints críticos
    if (error.status === 401 && error.url?.includes('/perfil')) {
      localStorage.clear();
      router.navigate(['/login']);
    }
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.throwError)(() => error);
  }));
};

/***/ }),

/***/ 9446:
/*!********************************************************!*\
  !*** ./src/app/core/interceptors/error.interceptor.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   errorInterceptor: () => (/* binding */ errorInterceptor)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var _services_notification_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/notification.service */ 5567);



const errorInterceptor = (req, next) => {
  const notificationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_services_notification_service__WEBPACK_IMPORTED_MODULE_0__.NotificationService);
  return next(req).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
    console.error('🔥 Error HTTP Global:', {
      status: error.status,
      url: error.url,
      message: error.message,
      error: error.error
    });
    // Manejar errores específicos que no fueron manejados por otros interceptores
    if (error.status === 404) {
      notificationService.warning('Recurso no encontrado');
    } else if (error.status === 400) {
      const message = error.error?.message || 'Datos inválidos';
      notificationService.error(message);
    }
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
  }));
};

/***/ }),

/***/ 8010:
/*!***********************************************!*\
  !*** ./src/app/core/services/auth.service.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthService: () => (/* binding */ AuthService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 9452);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../environments/environment */ 5312);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/router */ 5072);






class AuthService {
  constructor(http, router) {
    this.http = http;
    this.router = router;
    this.apiUrl = `${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/auth`;
    this.currentUserSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
    this.isLoggedInSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(false);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
    this.verificarSesionExistente();
  }
  /**
   * Verificar si hay una sesión activa al inicializar el servicio
   */
  verificarSesionExistente() {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      console.log('🔍 Verificando token existente con el servidor...');
      // Verificar si el token es válido obteniendo el perfil
      this.obtenerPerfil().subscribe({
        next: user => {
          console.log('✅ Token válido, usuario autenticado:', user);
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        },
        error: error => {
          console.error('❌ Token inválido, limpiando sesión:', error);
          this.limpiarSesion();
        }
      });
    } else {
      console.log('🚫 No hay token válido guardado');
      this.limpiarSesion();
    }
  }
  isTokenValid(token) {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
  /**
   * Iniciar sesión
   */
  login(credentials) {
    console.log('🔐 Intentando login con:', {
      email: credentials.email
    });
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(response => {
      console.log('✅ Login exitoso - respuesta completa:', response);
      console.log('🎩 Token recibido:', response.access_token.substring(0, 20) + '...');
      console.log('👤 Usuario recibido:', response.usuario);
      this.setToken(response.access_token);
      this.currentUserSubject.next(response.usuario);
      this.isLoggedInSubject.next(true);
      console.log('💾 Token guardado en localStorage');
      console.log('📋 Estado actualizado - isLoggedIn: true');
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
      console.error('❌ Error en login - NO se usará fallback:', error);
      let mensaje = 'Error de autenticación';
      if (error.status === 0) {
        mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else if (error.status === 401) {
        mensaje = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.status === 500) {
        mensaje = 'Error interno del servidor. Verifica que MongoDB esté ejecutándose.';
      }
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.throwError)(() => ({
        ...error,
        message: mensaje
      }));
    }));
  }
  /**
   * Registrar nuevo usuario
   */
  register(userData) {
    console.log('📝 Intentando registro con:', {
      email: userData.email,
      nombre: userData.nombre
    });
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(response => {
      console.log('✅ Registro exitoso:', response);
      this.setToken(response.access_token);
      this.currentUserSubject.next(response.usuario);
      this.isLoggedInSubject.next(true);
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
      console.error('❌ Error en registro - NO se usará fallback:', error);
      let mensaje = 'Error en el registro';
      if (error.status === 0) {
        mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else if (error.status === 400) {
        mensaje = error.error?.message || 'Datos inválidos. Verifica la información ingresada.';
      } else if (error.status === 500) {
        mensaje = 'Error interno del servidor. Verifica que MongoDB esté ejecutándose.';
      }
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.throwError)(() => ({
        ...error,
        message: mensaje
      }));
    }));
  }
  /**
   * Obtener perfil del usuario actual
   */
  obtenerPerfil() {
    return this.http.get(`${this.apiUrl}/perfil`).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
      console.error('Error al obtener perfil:', error);
      throw error;
    }));
  }
  /**
   * Verificar si un email está disponible
   */
  verificarEmailDisponible(email) {
    if (!email || email.trim() === '') {
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.of)(true); // Email vacío se considera disponible
    }
    return this.http.post(`${this.apiUrl}/verificar-email`, {
      email
    }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.map)(response => response?.disponible ?? true), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
      console.error('Error verificando email:', error);
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.of)(true); // En caso de error, asumir que está disponible
    }));
  }
  /**
   * Cambiar contraseña
   */
  cambiarPassword(passwordActual, passwordNueva) {
    return this.http.patch(`${this.apiUrl}/cambiar-password`, {
      passwordActual,
      passwordNueva
    });
  }
  /**
   * Renovar token
   */
  renovarToken() {
    return this.http.post(`${this.apiUrl}/renovar-token`, {}).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(response => {
      this.setToken(response.access_token);
      this.currentUserSubject.next(response.usuario);
    }));
  }
  /**
   * Cerrar sesión
   */
  logout() {
    const token = this.getToken();
    console.log('🚪 Cerrando sesión...');
    if (token) {
      // Llamar al endpoint de logout
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          console.log('✅ Logout exitoso en servidor');
          this.limpiarSesion();
        },
        error: error => {
          console.error('❌ Error en logout del servidor:', error);
          // Limpiar sesión local aunque falle el logout del servidor
          this.limpiarSesion();
        }
      });
    } else {
      this.limpiarSesion();
    }
  }
  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) {
      console.log('🚫 isAuthenticated: No hay token');
      return false;
    }
    // Verificar si el token no ha expirado
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      const isValid = payload.exp > now;
      if (!isValid) {
        console.log('⏰ Token expirado, limpiando sesión');
        this.limpiarSesion();
      } else {
        console.log('✅ Token válido');
      }
      return isValid;
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      this.limpiarSesion();
      return false;
    }
  }
  /**
   * Obtener token del localStorage
   */
  getToken() {
    const token = localStorage.getItem('cf_auth_token');
    // Solo hacer log cuando es necesario para debugging
    return token;
  }
  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUserSubject.value;
  }
  /**
   * Guardar token en localStorage
   */
  setToken(token) {
    console.log('💾 Guardando token en localStorage:', token.substring(0, 20) + '...');
    localStorage.setItem('cf_auth_token', token);
    console.log('✅ Token guardado exitosamente');
  }
  /**
   * Limpiar sesión completa
   */
  limpiarSesion() {
    console.log('🧽 Limpiando sesión completa...');
    localStorage.removeItem('cf_auth_token');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    console.log('✅ Sesión limpiada - usuario deslogueado');
  }
  /**
   * Decodificar token JWT (sin verificación)
   */
  decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decodificando token:', error);
      return {};
    }
  }
  /**
   * Método para verificar conectividad con el backend
   */
  verificarConectividad() {
    // Intentar el endpoint de test de auth
    return this.http.get(`${this.apiUrl}/test`, {
      responseType: 'json'
    }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.map)(response => {
      console.log('✅ Backend auth disponible:', response);
      return true;
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
      console.error('❌ Backend auth test falló:', error);
      // Intentar endpoint básico de health
      return this.http.get(`${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/health`, {
        responseType: 'json'
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_6__.map)(response => {
        console.log('✅ Backend health disponible:', response);
        return true;
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(healthError => {
        console.error('❌ Backend completamente no disponible');
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.of)(false);
      }));
    }));
  }
  static {
    this.ɵfac = function AuthService_Factory(t) {
      return new (t || AuthService)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_8__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_9__.Router));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineInjectable"]({
      token: AuthService,
      factory: AuthService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 5567:
/*!*******************************************************!*\
  !*** ./src/app/core/services/notification.service.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NotificationService: () => (/* binding */ NotificationService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/snack-bar */ 3347);


class NotificationService {
  constructor(snackBar) {
    this.snackBar = snackBar;
  }
  show(message, type, duration = 3000) {
    const config = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    };
    this.snackBar.open(message, 'Cerrar', config);
  }
  success(message, duration) {
    this.show(message, 'success', duration);
  }
  error(message, duration) {
    this.show(message, 'error', duration || 5000);
  }
  warning(message, duration) {
    this.show(message, 'warning', duration || 4000);
  }
  info(message, duration) {
    this.show(message, 'info', duration);
  }
  static {
    this.ɵfac = function NotificationService_Factory(t) {
      return new (t || NotificationService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__.MatSnackBar));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
      token: NotificationService,
      factory: NotificationService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 5312:
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   environment: () => (/* binding */ environment)
/* harmony export */ });
const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Cambiado para desarrollo local
};

/***/ }),

/***/ 4429:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ 436);
/* harmony import */ var _app_app_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/app.component */ 92);
/* harmony import */ var _app_app_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app/app.config */ 289);



(0,_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__.bootstrapApplication)(_app_app_component__WEBPACK_IMPORTED_MODULE_0__.AppComponent, _app_app_config__WEBPACK_IMPORTED_MODULE_1__.appConfig).catch(err => console.error(err));

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(4429)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map