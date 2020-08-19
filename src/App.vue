<template>
	<div class="">
		<!-- Xác thực App -->
		<div v-if="!isOAuth" class="auth">
			<div v-if="!showListStore" class="sign  d-flex flex-column align-items-center">
				<p class="text-dark mb-5">Đăng Nhập CMS</p>
				<input v-model="emailSignIn" type="text" class="form-control mb-3" placeholder="Email">
				<input v-model="pwdSignIn" type="password" class="form-control mb-3" placeholder="Password">
				<button class="btn btn-primary text-light " v-on:click="runSignIn()">Sign In</button>
			</div>
			<div :class="['select-store', 'mb-5', {'show-store': showListStore}]">
				<div v-if="showListStore">
					<p class="text-center mb-5">Danh sách Store</p>
					<div v-for="(item, ind) in listStore" class="store" @click="handleChooseStore(item)" :key="ind">
						{{ item.store_name }}
					</div>
				</div>
			</div>
			<div v-if="overlaySign" class="overlay"></div>
		</div>
		<!--End Xác thực App -->

		<div v-if="isOAuth" class="widget">
			<div class="d-flex header border-bottom" >
				<div class="list-order flex-grow-1 text-center py-2" :class="{'select': isSelectList}" @click="handleClickHeader('list')">
					Thông tin
				</div>
				<div class="create-order flex-grow-1 text-center py-2" :class="[isSelectList ? '' : 'select']" @click="handleClickHeader('create')">
					Tạo đơn
				</div>
			</div>
			<list-order v-show="isSelect === 'list'"
				:appToken="appToken"
				:phoneProp="phoneProp"
				@click-edit="handleClickHeader('create')"/>
			<create-order
				v-show="isSelect === 'create'"
				:appToken="appToken" :msgClientId="msgClientId" :msgToken="msgToken"
				:phoneProp="phoneProp" :nameProp="nameProp" :emailProp="emailProp"
				@switch-header="handleClickHeader('list')"/>
		</div>
	</div>
</template>

<script>

import EventBus from './EventBus.js';
import Restful from '@/services/resful.js';
import CreateOrder from './components/CreateOrder';
import ListOrder from './components/ListOrder';

let urlString = location.href;
let url = new URL(urlString);
let accessToken = url.searchParams.get("access_token");
const ApiBase = "https://app.devchatbox.tk";
// const ApiBase = "https://chatbox-app.botbanhang.vn";

const Toast = Swal.mixin({
  	toast: true,
  	position: 'top',
  	showConfirmButton: false,
 	timer: 1500,
  	timerProgressBar: false,
 	onOpen: (toast) => {
    	toast.addEventListener('mouseenter', Swal.stopTimer)
    	toast.addEventListener('mouseleave', Swal.resumeTimer)
  	},
  	width: '80vw'
})
const Toast2 = Swal.mixin({
  	toast: true,
  	position: 'top',
  	showConfirmButton: false,
 	timer: 3000,
  	timerProgressBar: false,
 	onOpen: (toast) => {
    	toast.addEventListener('mouseenter', Swal.stopTimer)
    	toast.addEventListener('mouseleave', Swal.resumeTimer)
  	},
  	width: '80vw'
})

export default {
	data() {
		return {
			isOAuth: false,
			// secretKey: '2dd3816056a04c70ad154d3943bb16bd',
			secretKey: 'd8b089bdafbe47809fe590c3f923e817',
			accessToken: accessToken,
			isSelect: 'list',
			emailSignIn: '',
			pwdSignIn: '',
			overlaySign: true,
			showListStore: false,
			listStore: [],
			nameProp: '',
			phoneProp: '',
			emailProp: '',
			msgToken: '',
			msgClientId: '',
			appToken: ''
		}
	},
	computed: {
		isSelectList() {
			return this.isSelect === 'list';
		}
	},
	components: {
		ListOrder,
		CreateOrder
	},
	methods: {
		async runSignIn() {
			try {

				// Call Api Đăng nhập CMS
				let path = "https://api.botup.io/v1/auth/sign-in";
				let body = {
					email: this.emailSignIn,
					password: this.pwdSignIn
				}
				let signIn = await Restful.post(path, body);
				let user = {}
				if (signIn.data && signIn.data.data && signIn.data.data.user) {
					user = signIn.data.data.user;
				} else {
					throw 'Đăng nhập thất bại'
				}
				let { email, first_name, last_name, id, role } = user;
				path = "https://ext.botup.io/v1/users/users/singinbotup";
				body = {
					username: id,
					email,
					first_name,
					last_name,
					role
				}

				// Call Api Đăng nhập Botup
				let signInBotup = await Restful.post(path, body);
				console.log('singin botup', signInBotup.data);

				// Lấy danh sách Store
				path = "https://ext.botup.io/v1/selling-page/store/store_read";
				let params = {}
				if (signInBotup.data && signInBotup.data.data && signInBotup.data.data.user && signInBotup.data.data.user.id) {
					params = {
						owner_id: signInBotup.data.data.user.id
					}
				} else {
					throw 'Đăng nhập thất bại'
				}

				let readStore = await Restful.get(path, params)
				console.log('store', readStore.data);
				if (readStore.data && readStore.data.data) {
					this.listStore = readStore.data.data;
					this.showListStore = true;
				} else {
					throw 'Lỗi khi lấy danh sách Store';
				}
			} catch(e) {
				console.log('error', e);
				if (e.data.message) {
					Toast2.fire({
					  	icon: 'error',
					  	title: e.data.message
					})
					return
				}
				Toast2.fire({
					icon: 'error',
					title: e
				})
			}
		},
		handleChooseStore(item) {
			this.appToken = item.store_token;
			this.runOAuth();
		},
		async runOAuth() {
	      	try {

	      		// Call Api xác thực khi chọn Store và lưu lại Token
	      		let token_partner = this.appToken;
	      		console.log(token_partner)
	        	let body = {
		         	_type: "oauth-access-token",
		          	access_token: this.accessToken,
		          	token_partner
	        	};

	        	// Xác thực Widget
	        	let Oauth = await Restful.post(`${ApiBase}/v1/app/app-installed/update`, body);
	        	console.log('Oauth', Oauth)
	        	if (Oauth) {
	        		this.isCompleteAuth = true;
	        		Toast2.fire({
					  	icon: 'success',
					  	title: "Xác thực thành công"
					})
	        		window.close();
	        	}
	      	} catch (e) {
	        	console.log(e);
	        	Toast2.fire({
				  	icon: 'error',
				  	title: "Xác thực không thành công"
				})
	      	}
    	},
		handleClickHeader(ele) {
			this.isSelect = ele;
			if (ele === 'list') {
				EventBus.$emit('disable-update-order');
			}
		}
	},
	watch: {
		phoneProp() {
			console.log('change phone')
		}
	},
	async created() {
		try	{
			console.log('creeeee apppp')
			let body = {
	        	access_token: this.accessToken,
	        	secret_key: this.secretKey
	    	};

	    	// Check trạng thái Xác thực của Widget
			let getCustomerInfo = await Restful.post(`${ApiBase}/v1/service/partner-authenticate`, body);
			if (getCustomerInfo.data.succes && getCustomerInfo.data.code == 200) {
			  	this.isOAuth = true;
			  	console.log('auth created', getCustomerInfo.data.data.conversation_contact)
				if (getCustomerInfo.data.data && getCustomerInfo.data.data) {
					let cus = getCustomerInfo.data.data;
					if (cus.public_profile) {
						this.appToken = cus.public_profile.token_partner;
						this.nameProp = cus.public_profile.client_name;
						this.msgClientId = cus.public_profile.fb_client_id;
					}
					if (cus.conversation_contact && cus.conversation_contact.client_phone) {
				  		this.phoneProp = cus.conversation_contact.client_phone;
				  		this.phoneProp = this.phoneProp.split('.').join('').split(' ').join('');
				  	}
					if (cus.conversation_contact && cus.conversation_contact.client_email) {
						this.emailProp = cus.conversation_contact.client_email;
					}
					if (cus.conversation_chatbot) {
						this.msgToken = cus.conversation_chatbot.bbh_public_token;
					}
				  	console.log('info cus', getCustomerInfo)
				}

	    	}
		} catch(error) {

			// Chạy vào SignIn
			this.overlaySign = false;
			this.isOAuth = false;
			console.log('info err', error);
		}
	}
}
</script>

<style>

	/*Bootstrap*/
	:root {
		--bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
	}
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	body {
		margin: 0;
		font-family: var(--bs-font-sans-serif);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		color: #212529;
		background-color: #fff;
		-webkit-text-size-adjust: 100%;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	}

	html {
		font-size: 13px;
	}
	body::-webkit-scrollbar {
		display: none;
	}
	.disable-scroll {
		overflow: hidden;
		height: 100vh;
	}
	body > div {
		margin: 0;
		padding: 0;
	}
	p {
		margin-top: 0;
		margin-bottom: 1rem;
	}
	button {
		border-radius: 0;
	}
	button:focus {
		outline: 1px dotted;
		outline: 5px auto -webkit-focus-ring-color;
	}
	input,
	button,
	select,
	textarea {
		margin: 0;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}
	button,
	input {
		overflow: visible;
	}
	button,
	select {
		text-transform: none;
	}
	select {
	  word-wrap: normal;
	}
	button {
	  -webkit-appearance: button;
	}
	button:not(:disabled) {
	  cursor: pointer;
	}
	textarea {
	  	resize: vertical;
	}
	img {
  		vertical-align: middle;
	}

	/*Flex*/
	.d-flex {
	  	display: flex !important;
	}
	.flex-column {
	  	flex-direction: column !important;
	}
	.align-items-center {
	  	align-items: center !important;
	}
	.align-self-start {
  		align-self: flex-start !important;
	}
	.flex-grow-1 {
  		flex-grow: 1 !important;
	}
	.justify-content-between {
  		justify-content: space-between !important;
	}
	.justify-content-center {
		justify-content: center !important;
	}

	/*Spacing*/
	.m-0 {
  		margin: 0 !important;
	}
	.p-0 {
  		padding: 0 !important;
	}
	.mx-2 {
  		margin-right: 0.5rem !important;
  		margin-left: 0.5rem !important;
	}
	.ml-auto {
  		margin-left: auto !important;
	}
	.ml-1 {
  		margin-left: 0.25rem !important;
	}
	.ml-2 {
  		margin-left: 0.5rem !important;
	}
	.mr-1 {
  		margin-right: 0.25rem !important;
	}
	.mr-2 {
  		margin-right: 0.5rem !important;
	}
	.my-3 {
	  	margin-top: 1rem !important;
	  	margin-bottom: 1rem !important;
	}
	.mt-1 {
	  	margin-top: 0.25rem !important;
	}
	.mt-2 {
	  	margin-top: 0.5rem !important;
	}
	.mt-3 {
	  	margin-top: 1rem !important;
	}
	.mb-3 {
	  	margin-bottom: 1rem !important;
	}
	.mb-4 {
	  margin-bottom: 1.5rem !important;
	}
	.mb-5 {
	  margin-bottom: 3rem !important;
	}
	.mt-3 {
  		margin-top: 1rem !important;
	}
	.py-2 {
  		padding-top: 0.5rem !important;
 		padding-bottom: 0.5rem !important;
	}
	.pb-4 {
	  padding-bottom: 1.5rem !important;
	}
	.pb-5 {
  		padding-bottom: 3rem !important;
	}
	.w-100 {
  		width: 100% !important;
	}

	/*Border*/
	.border {
  		border: 1px solid #dee2e6 !important;
	}
	.border-top {
  		border-top: 1px solid #dee2e6 !important;
	}
	.border-bottom {
  		border-bottom: 1px solid #dee2e6 !important;
	}
	.rounded {
  		border-radius: 0.35rem !important;
	}

	/*Form*/
	.form-row {
	    display: -ms-flexbox;
	    display: flex;
	    flex-wrap: wrap;
	    margin-right: -5px;
	    margin-left: -5px;
	}
	.form-row>.col, .form-row>[class*=col-] {
	    padding-right: 5px;
	    padding-left: 5px;
	}
	.form-control {
		display: block;
		width: 100%;
		min-height: calc(1.5em + 0.75rem + 2px);
		padding: 0.375rem 0.75rem;
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		color: #495057;
		background-color: #fff;
		background-clip: padding-box;
		border: 1px solid #ced4da;
		appearance: none;
		border-radius: 0.25rem;
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}
	@media (prefers-reduced-motion: reduce) {
		.form-control {
			transition: none;
	  	}
	}
	.form-control:focus {
		color: #495057;
		background-color: #fff;
		border-color: #8bbafe;
		outline: 0;
		box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
	}
	.form-control::placeholder {
		color: #6c757d;
	  	opacity: 1;
	}
	.col {
  		flex: 1 0 0%;
	}

	/*Button*/
	.btn {
		display: inline-block;
		font-weight: 400;
		line-height: 1.5;
		color: #212529;
		text-align: center;
		text-decoration: none;
		vertical-align: middle;
		cursor: pointer;
		user-select: none;
		background-color: transparent;
		border: 1px solid transparent;
		padding: 0.375rem 0.75rem;
		font-size: 1rem;
		border-radius: 0.25rem;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}
	@media (prefers-reduced-motion: reduce) {
	  	.btn {
	    	transition: none;
	  	}
	}
	.btn:hover {
	  	color: #212529;
	}
	.btn:focus {
	  	outline: 0;
	  	box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
	}
	.btn-primary {
	  	color: #fff;
	  	background-color: #0d6efd;
	  	border-color: #0d6efd;
	}
	.btn-primary:hover {
	  	color: #fff;
	  	background-color: #025ce2;
	  	border-color: #0257d5;
	}
	.btn-primary:focus {
	  	color: #fff;
	  	background-color: #025ce2;
	  	border-color: #0257d5;
	  	box-shadow: 0 0 0 0.2rem rgba(49, 132, 253, 0.5);
	}
	.btn-primary:active {
		color: #fff;
		background-color: #0257d5;
		border-color: #0252c9;
	}
	.btn-primary:active:focus {
  		box-shadow: 0 0 0 0.2rem rgba(49, 132, 253, 0.5);
	}
	.close {
		float: right;
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		color: #000;
		text-shadow: 0 1px 0 #fff;
		opacity: .5;
	}
	button.close {
	    padding: 0;
	    background-color: transparent;
	    border: 0;
	    appearance: none;
	}

	/*Text*/
	.text-light {
  		color: #f8f9fa !important;
	}
	.text-center {
	  text-align: center !important;
	}
	.text-right {
  		text-align: right !important;
	}
	.text-dark {
  		color: #343a40 !important;
	}
	.text-primary {
  		color: #0d6efd !important;
	}
	.text-danger {
	  	color: #dc3545 !important;
	}

	/* Auth ---- */
	.auth {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px;
		top: 12%;
		width: 100%;
		z-index: 999;
	}
	.auth p {
		font-size: 1.6rem;
		font-weight: bold;
	}
	.auth .sign {
		width: 100%;
	}
	.auth .sign input {
		width: 100%;
		height: 35px;
	}
	.auth .sign button {
		font-weight: bold;
		box-shadow: 0 5px 15px 0 #007bff30;
		transition: all 0.5s;
		border-radius: 25px;
		padding: 10px 40px;
		margin-top: 20px;
	}
	.auth .sign button:hover {
		background: #007bff;
		box-shadow: 0 5px 20px 0 #007bff30;
	}
	.auth .sign button:focus {
		box-shadow: 0 5px 20px 0 #007bff30 !important;
		background: #007bff !important;
	}
	.select-store {
		width: 100%;
		opacity: 0;
		height: 0;
		transition: all 0.4s ease-out 0.2s;
	}
	.select-store .store {
		cursor: pointer;
		padding: 20px 10px;
	    border: 2px solid #0001;
	    border-radius: 5px;
	    font-weight: bold;
	    border-bottom: none;
	    background: #fff;
	    transition: transform 0.2s ease-out, border-bottom 0s, background 0.7s ease-out;
	}
	.select-store .store:last-child {
		border-bottom: 2px solid #0001;
	}
	.select-store .store:hover {
		transform: translateY(-5px) scale(1.03);
		border-bottom: 2px solid #0001;
		background: #ddd;
	}
	.select-store .store:active {
		transform: translateY(-3px);
	}
	.show-store {
		height: initial;
		opacity: 1;
	}
	.auth .overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #fff;
	}
	@media screen and (min-width: 400px) {
		.auth {
			width: 70%;
		}
		.auth p {
			font-size: 1.9rem;
		}
	}

	/* --------------- */
	.widget {
	}
	.widget .header {
		cursor: pointer;
		user-select: none;
	}
	.widget .header > div {
		font-weight: bold;
		font-size: 1.05rem;
	}
	.widget .header .select {
		border-bottom: 2px solid #0d6efd;
	}
</style>
