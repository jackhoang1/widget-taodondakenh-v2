<template>
	<div>

		<!-- Widget -->
		<div :class="{ 'app': true, 'disable-scroll': isShowPopup, 'disable-scroll': isShowOrderInfo}">
			<div class="main">
			<div class="customer-info border-bottom">
				<p class="mb-4 text-center">ORDER {{ platformType }}</p>

				<div class="setting-msg-area" :class="{ show: isShowSettingMsg}">
					<textarea
						rows="4"
						v-if="isShowSettingMsg"
						v-model="msgContent"
						class="form-control mt-3 mb-3 rounded">
					</textarea>
					<button
						v-if="isShowSettingMsg"
						class="btn btn-primary w-100 mb-4 py-2"
						@click="showSettingMsg">
						Done
					</button>
				</div>
				<!-- Forrm điền thông tin khách hàng -->
				<div class="form-row">
				<div class="col">
					<input v-model="name" type="text" class="form-control rounded" placeholder="Họ tên">
				</div>
				<div class="col">
					<input v-model="phone" type="text" class="form-control rounded" placeholder="Số điện thoại">
				</div>
				</div>
				<input v-model="email" type="email" class="form-control rounded" placeholder="Email"/>
				<div class="form-row">
					<div class="col">
						<select v-model='country' class="form-control rounded">
							<option selected value="">Quốc Gia</option>
							<option value="Việt Nam">Việt Nam</option>
						</select>
					</div>
					<div class="col">
						<select v-model="city" v-on:change="handleChooseCity()" class="form-control rounded">
							<option selected :value="{}">Tỉnh/Tp</option>
						<option v-for="(item, ind) in listCity" :value="item" :key="ind">{{item.name}}</option>
						</select>
					</div>
				</div>
				<div class="form-row">
					<div class="col">
						<select v-model="district" v-on:change="handleChooseDistrict()" class="form-control rounded">
					    	<option selected :value="{}">Quận/Huyện</option>
					    	<option v-for="(district, ind) in listDistrict" :value="district" :key="ind">{{district.name}}</option>
					  	</select>
					</div>
					<div class="col">
					  	<select v-model="ward" class="form-control rounded">
					    	<option selected :value="{}">Phường/Xã</option>
					    	<option v-for="(ward, ind) in listWard" :value="ward" :key="ind">{{ward.name}}</option>
					  	</select>
					</div>
				</div>
				<input v-model="street" type="text" class="form-control rounded" placeholder="Địa chỉ cụ thể"/>
				<div v-if="hasBranch">
					<select v-model="branch" class="form-control rounded">
					    <option selected :value="{}">Chi Nhánh</option>
					    <option v-for="(branch, ind) in listBranch" :value="branch" :key="ind">{{branch.branchName}}</option>
				 	</select>
				</div>
				<!--End Forrm điền thông tin khách hàng -->

				<img
					@click="showSettingMsg"
					class="setting-msg"
					src="https://img.icons8.com/cotton/64/000000/chat-settings.png"
					title="Chỉnh sủa mẫu tin nhắn" />

			</div>

			<div class="product">

				<!-- Tìm sản phẩm và Tạo ghi chú -->
				<div class="option mt-3 mb-4 d-flex">
					<div class="d-flex align-items-center flex-grow-1">
						<img class="mr-2" src="../assets/add.png" alt="add product">
						<p class="text-primary m-0" @click="handleShowPopup()">Thêm sản phẩm</p>
					</div>
					<div class="d-flex align-items-center flex-grow-1" @click="handleShowNote()">
						<img class="mr-2" src="../assets/note.png" alt="add note">
						<p class="text-primary m-0">Thêm ghi chú</p>
					</div>

				</div>
				<div :class="['form-group', { 'show-note': isShowNote }]">
				    <textarea
				    	rows="3"
				    	v-model="note"
				    	ref="note"
				    	class="form-control mb-3 rounded"
				    	:class="{'hide': !isShowNote}">
				    </textarea>
				    <button
				    	@click="handleShowNote()"
				    	class="btn btn-primary w-100 mb-4 rounded"
				    	:class="{'hide': !isShowNote}">
				    	Done
				   	</button>
				</div>
				<!-- End Tìm sản phẩm và Tạo ghi chú -->

				<!-- Giỏ hàng -->
				<div class="list-product">
					<div class="product-detail d-flex align-items-center border-top" v-for="(item, ind) in cart" :key="ind">
						<img class="border rounded mr-1" :src="item.product_image || 'https://img.icons8.com/officexs/80/000000/spinner-frame-6.png'" alt="product">
						<div class="align-self-start">
							<p class="name m-0" :title="item.product_name">{{ item.product_name }}</p>
							<p class="m-0" :title="item.other_info">{{ item.other_info }}</p>
						</div>
						<div class="quantity d-flex align-items-center border rounded ml-1">
							<p class="flex-grow-1 text-center">{{ item.product_quantity }}</p>
							<div class="ml-auto mr-1 d-flex flex-column justify-content-between">
								<button @click="handleAddQuantity(item)" class="btn p-0"><img src="https://img.icons8.com/ios-glyphs/24/000000/chevron-up.png"/></button>
								<button @click="handleSubQuantity(item)" class="btn p-0"><img src="https://img.icons8.com/ios-glyphs/24/000000/chevron-up.png"/></button>
							</div>
						</div>
						<div class="ml-auto price">
							<p class="price text-right">{{ item.product_price | toCurrency }}</p>
						</div>
						<div class="edit ml-1 d-flex flex-column justify-content-between">
							<img @click="handleDeleteCart(item)" src="../assets/del-icon.png" alt="delete" title="xoá">
						</div>
					</div>
				</div>
				<!-- End Giỏ hàng -->

				<!-- Tổng tiền và tạo đơn hàng -->
				<div class="order border-top">
					<div class="total-price d-flex justify-content-between my-3">
						<p>Tổng tiền</p>
						<p>{{ totalPrice | toCurrency }}</p>
					</div>
					<button @click="handleCreateOrder()" class="btn btn-primary py-2 mb-4 w-100 rounded">Tạo đơn hàng</button>
				</div>
				<!-- End Tổng tiền và tạo đơn hàng -->
			</div>

			<!-- Popup tìm sản phẩm-->
			<div :class="{ 'popup': true, 'show-popup': isShowPopup}">
				<div class="d-flex align-items-center" :class="{ 'hidden-search': !isShowPopup}">
					<div class="search rounded d-flex align-items-center flex-grow-1" :class="{ 'hidden-search': !isShowPopup}">
						<img class="mx-2" src="https://img.icons8.com/ios-glyphs/48/000000/search.png" alt="icon" />
						<input @keyup.enter="handleSearch()" v-model="searchValue" class="flex-grow-1" type="text" placeholder="Tìm sản phẩm">
					</div>
					<button @click="handleClosePopup()">
						<img src="https://img.icons8.com/ios/48/000000/multiply.png"/>
					</button>
				</div>
				<div v-show="isShowPopup" class="list-product">
					<div v-if="!filterListProduct.length"
						class="product d-flex align-items-center border-bottom border-top py-2"
						v-for="(item, ind) in listProduct" :key="ind" @click="handleAddToCart(item)">
						<img class="border rounded mr-2" :src="item.image || 'https://img.icons8.com/officexs/80/000000/spinner-frame-6.png'" alt="product">
						<div class="flex-grow-1">
							<p class="m-0" :title="item.product_name">{{ item.product_name.substring(0, 60) + '...' }}</p>
							<p class="m-0">{{ item.product_option }}</p>
							<p class="text-right mt-1">{{ item.product_price | toCurrency }}</p>
						</div>
					</div>
					<div v-if="filterListProduct.length"
						class="product d-flex align-items-center border-bottom border-top py-2"
						v-for="(item, ind) in filterListProduct" :key="ind" @click="handleAddToCart(item)">
						<img class="border rounded mr-2" :src="item.image || 'https://img.icons8.com/officexs/80/000000/spinner-frame-6.png'" alt="product">
						<div class="flex-grow-1">
							<p class="m-0" :title="item.product_name">{{ item.product_name.substring(0, 60) + '...' }}</p>
							<p class="m-0">{{ item.product_option }}</p>
							<p class="text-right mt-1">{{ item.product_price | toCurrency }}</p>
						</div>
					</div>
				</div>
			</div>
			<!-- End Popup tìm sản phẩm-->

			<!-- Thông tin đơn hàng -->
			<div :class="[ 'order-info', { 'show-order-info': isShowOrderInfo }]">
				<div v-if="isShowOrderInfo">
					<p class="mt-2 mb-3">Thông tin đơn hàng</p>
					<p>Khách hàng: {{name}}</p>
					<p>Số điện thoại: {{phone}}</p>
					<p>Email: {{email}}</p>
					<p>Địa chỉ: {{address}}</p>
					<p v-if="note">Ghi chú: {{note}}</p>
					<br>
					<p>Danh sách sản phẩm:</p>
					<p v-for="(item, ind) in cart" :key="ind">
						{{`${item.product_quantity}  ${item.product_name}`}}
					</p>
					<br>
					<p>Tổng giá trị đơn hàng:</p>
					<p>{{totalPrice | toCurrency}}</p>
					<button
					 @click="handleCallApiOrder()"
					 :class="['btn', 'btn-primary', 'mt-3', 'mb-4', 'w-100', 'rounded', {'prevent-click': preventClick}]">
						Xác nhận
					</button>
					<button class="close" @click="closeOrderInfo()">
						<img src="https://img.icons8.com/ios/48/000000/delete-sign.png"/>
					</button>
				</div>
			</div>
			<!-- End Thông tin đơn hàng -->
			</div>
		</div>
	</div>
</template>

<script>

import EventBus from '../EventBus.js';
import Restful from "@/services/resful.js";

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
	props: ['appToken', 'msgClientId', 'msgToken', 'phoneProp', 'nameProp', 'emailProp'],
	data() {
		return {
			// secretKey: '2dd3816056a04c70ad154d3943bb16bd',
			secretKey: 'd8b089bdafbe47809fe590c3f923e817',
			emailSignIn: '',
			pwdSignIn: '',
			overlaySign: true,
			showListStore: false,
			listStore: [],
			platformType: '',
			name: '',
			phone: '',
			street: '',
			country: '',
			listCity: [],
			city: {},
			listDistrict: [],
			district: {},
			listWard: [],
			ward: {},
			email: '',
			listBranch: [],
			branch: {},
			hasBranch: false,
			address: '',
			clientId: '',
			listProduct: [],
			filterListProduct: [],
			isShowPopup: false,
			searchValue: '',
			note: '',
			isShowNote: false,
			cart: [],
			orderId: '',
			totalPrice: 0,
			isShowOrder: false,
			isShowOrderInfo: false,
			preventClick: false,
			basePath: 'https://ext.botup.io/v1/selling-page/',
			msgContent: 'Quý khách đã tạo thành công đơn hàng số {{order_id}} , đơn hàng của quý khách đang được giao vận.',
			isShowSettingMsg: false,
			isUpdateOrder: false,
			waitToCreateEmptyOrder: false
		}
	},
	methods: {
	    async handleChooseCity() {
	    	try {
	    		console.log('handle here', this.city)
	    		let path = 'https://ext.botup.io/v1/delivery/subvn/thongtin/quanhuyen';
	    		let params = {
	    			matinh: this.city.code
	    		}

				// Lấy danh sách quận/huyện
	    		let getListDistrict = await Restful.get( path, params);
				if (getListDistrict.data && getListDistrict.data.data) {
					this.listDistrict = getListDistrict.data.data;
				}
	    	} catch(error) {
	    		console.log('error', error);
	    	}
	    },
	    async handleChooseDistrict() {
	    	try {
	    		let path = 'https://ext.botup.io/v1/delivery/subvn/thongtin/xaphuonghuyen';
	    		let params = {
	    			mahuyen : this.district.code
	    		}
	    		let getListWard =  await Restful.get( path, params);
	    		this.listWard = getListWard.data.data;
	    	} catch(error) {
	    		console.log('error', error);
	    	}
	    },
	    async handleShowPopup() {
	    	// Show Popup khi nhấn "Thêm sản phẩm"
	    	try {
	    		this.isShowPopup = !this.isShowPopup;
				this.getListProduct({ access_token: this.appToken })
	    	} catch(error) {
	    		console.log('error', error);
	    		Toast.fire({
				  	icon: 'error',
				  	title: 'Đã xảy ra lỗi'
				})
	    	}
	    },
    	async handleSearch() {
			try {
				if(this.searchValue) {

					if(this.platformType === 'HARAVAN' || this.platformType === 'SAPO') {
						this.searchByFilter();
						return;
					}

					// Tìm sản phẩm
					let searchValueData = this.searchValue;
					let searchValue = searchValueData.split(' ')[0];
					let path = this.basePath + 'product/product_read';
					let params = {
						access_token : this.appToken,
						search : searchValue
					}
					await this.getListProduct(params);
					if (this.listProduct.length) return;

					// Search với các searchValue viết hoa kí tự đầu
					searchValue = searchValueData.charAt(0).toUpperCase() + searchValue.substring(1);
					params.search = searchValue;
					await this.getListProduct(params);
					if (this.listProduct.length) return;

					// Search với các searchValue viết thường
					searchValue = searchValueData.toLowerCase().split(' ')[0];
					params.search = searchValue;
					await this.getListProduct(params);

					if (!this.listProduct.length) {
						Toast.fire({
				  			icon: 'error',
				  			title: 'Không tìm thấy sản phẩm'
						})
					}
				}
			} catch(error) {
				console.log('error', error);
			}
    	},
		searchByFilter() {
			let products = this.listProduct;
			let search = this.searchValue.toLowerCase();
			console.log('search', search)
			this.filterListProduct = products.filter(item => {
				console.log('here', item.product_name.toLowerCase())
				return item.product_name.toLowerCase().includes(search);
			})
		},
	    handleClosePopup() {
	    	// Close Popup tìm sản phẩm
	    	this.isShowPopup = !this.isShowPopup;
	    	this.searchValue = '';
			this.filterListProduct = [];
	    	this.getCart();
	    },
	    handleShowNote() {
	    	this.isShowNote = !this.isShowNote;
	    	if (this.isShowNote) {
	    		setTimeout(() => {
	    			this.$refs.note.focus()
	    		});
	    	}
	    },
	    async getCart() {
	    	try {
	    		// Lấy giỏ hàng
	    		let path = this.basePath + 'cart/cart_read';
	    		let params = {
	    			access_token : this.appToken,
	    			client_id : this.clientId,
	    			sort: 'createdAt DESC'
	    		}
	    		let getCart = await Restful.get( path, params);
				if (getCart.data && getCart.data.data) {
					this.cart = getCart.data.data;
				}

	    		// Tính tổng giá trị giỏ hàng
    			let total = [];
    			if (this.cart.length > 0) {
		            this.cart.forEach(item => {
		            let totalInArray = item.product_price * item.product_quantity
		              total.push(totalInArray)
		            })
		            this.totalPrice = total.reduce((a, b) => a + b);
		        } else {
		          	this.totalPrice = 0;
		        }
	    	} catch(error) {
	    		console.log('error', error);
	    	}
	    },
	    async handleAddToCart(item) {
	    	try {
	    		// Lỗi nếu sản phẩm ko có giá
	    		if (!item.product_price) {
	    			Toast.fire({
			  			icon: 'error',
			  			title: 'Thêm sản phẩm thất bại'
					})
		    		return;
		    	}
		    	let path = this.basePath + 'cart/cart_add_product';
		    	let body = {
				    "access_token" : this.appToken,
				    "product_id": item.product_id,
				    "client_id": this.clientId || "",
				    "product_price": item.product_price,
				    "product_quantity": 1,
				    "product_name": item.product_name,
				   	"product_image": item.image || "",
					"other_info": item.product_option
		    	}

		    	// Thêm sản phẩm vào giỏ hàng
		    	let postToCart = await Restful.post( path, body);
		    	console.log(postToCart.data)

		    	// Lưu client_id và lưu vào localStorage
				if (postToCart.data && postToCart.data.data && postToCart.data.data.client_id) {
					this.clientId = postToCart.data.data.client_id;
					this.clientId && localStorage.setItem('client_id', this.clientId);
				}

	    		Toast.fire({
					icon: 'success',
					title: 'Thêm sản phẩm thành công'
				})
	    	} catch(error) {
	    		console.log('error', error);
	    		Toast.fire({
		  			icon: 'error',
		  			title: 'Thêm sản phẩm thất bại'
				})
	    	}
	    },
	    async handleDeleteCart(item) {
	    	try {
	    		let path = this.basePath + 'cart/cart_delete_product';
		    	let body = {
		    		"access_token" : this.appToken,
		    		"product_id": item.product_id,
		    		"client_id": this.clientId
		    	}
		    	let postDeleteCart = await Restful.post( path, body);
		    	Toast.fire({
					icon: 'success',
					title: 'Đã xóa sản phẩm'
				})

				// Load lại giỏ hàng
	    		this.getCart();
	    	} catch(error) {
	    		console.log('error', error);
	    		Toast.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
	    	}
	    },
	    async handleAddQuantity(item) {
	    	try {

	    		// Tăng số lượng sản phẩm trong giỏ hàng
	    		let path = this.basePath + 'cart/cart_add_product';
	    		let body = {
	    			"access_token" : this.appToken,
				    "product_id": item.product_id,
				    "client_id": this.clientId
	    		}
	    		let postAddQuantity = await Restful.post( path, body);

	    		// Load lại giỏ hàng
	    		this.getCart();

	    	} catch(error) {
	    		console.log(error, 'error');
	    		Toast.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
	    	}
	    },
	    async handleSubQuantity(item) {
	    	try {

	    		// Tăng số lượng sản phẩm trong giỏ hàng
	    		let path = this.basePath + 'cart/cart_sub_product';
	    		let body = {
	    			"access_token" : this.appToken,
				    "product_id": item.product_id,
				    "client_id": this.clientId
	    		}
	    		let postAddQuantity = await Restful.post( path, body);

	    		// Load lại giỏ hàng
	    		this.getCart();

	    	} catch(error) {
	    		console.log(error, 'error');
	    		Toast.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
	    	}
	    },
	    handleCreateOrder() {
    		if (this.cart.length === 0) {
	    		Toast.fire({
					icon: 'error',
					title: 'Giỏ hành trống'
				})
				return;
	    	}

	    	// Validate form thông tin khách hàng
	    	if (!this.name || !this.phone || !this.country
	    		|| !this.city.name || !this.district.name || !this.ward.name || !this.email) {

	    		Toast.fire({
					icon: 'error',
					title: 'Vui lòng điền đầy đủ thông tin'
				})
				return;
	    	}

	    	// Check trạng thái chọn chọn chi nhánh
	    	if (this.listBranch[0]) {
	    		if (!Object.keys(this.branch)[0]) {
	    			Toast.fire({
						icon: 'error',
						title: 'Vui lòng chọn chi nhánh'
					})
					return;
	    		}
	    	}

	    	// Check phone là kiểu Number
	    	if (isNaN(Number(this.phone))) {
	    		Toast.fire({
					icon: 'error',
					title: 'Số điện thoại không hợp lệ'
				})
				return;
	    	}
	    	this.address = `${this.street}, ${this.ward.name}, ${this.district.name}, ${this.city.name}`;

	    	// Hiện thông tin đơn hàng
			this.isShowOrderInfo = true;
	    },
	    async handleCallApiOrder() {
	    	try {

				// Check xem đang tạo mới order hay update order
				if (this.isUpdateOrder) {
					this.updateOrder()
					return
				}

	    		// Ngăn spam "Tạo đơn hàng"
		    	this.preventClick = true;

	    		let path = `${this.basePath}order/order_create_3rd`;
	    		let body = {
		    		"access_token" : this.appToken,
				    "product_info": this.cart,
				    "customer_name": this.name,
				    "customer_phone": this.phone,
				    "customer_email": this.email,
				    "customer_address": this.address,
				    "customer_city_name": this.city.name,
				    "customer_province_name": this.city.name,
				    "customer_district_name": this.district.name,
				    "customer_ward_name": this.ward.name,
				    "customer_street_name": this.street,
				    "note": this.note,
					"status": "unconfirmed",
				    "platform_type": this.platformType,
				    "branchId": this.branch.id
	    		}
	    		if (!body.branchId) delete body.branchId;
	    		if (!this.city.name.includes('Tỉnh')) {
	    			delete body["customer_province_name"]
	    		}

				// Tạo customer mới đối với Haravan
				if (this.platformType === 'HARAVAN') {
					this.createHaravanCustomer(body);
					return
				}
				this.callOrder( path, body);
			} catch(e) {
				console.log(e);
			}
	    },
		async callOrder(path, body) {
			try {
				// Call Api tạo đơn hàng
	    		let postCreateOrder = await Restful.post( path, body);
				if (postCreateOrder.data && postCreateOrder.data.data && (postCreateOrder.data.data.snap_order || this.platformType === 'CUSTOM')) {
					if (this.platformType !== 'CUSTOM') {
						if (postCreateOrder.data.data.snap_order.errors) {
							throw postCreateOrder.data.data.snap_order

						}
					}
					EventBus.$emit('call-order');

					// Đẩy tin nhắn về Msg
					if (postCreateOrder.data.data.order_id) {
						let content = this.covertMsgContent(postCreateOrder.data.data.order_id);
						this.sendMessage(content);
					} else {
						let content = this.covertMsgContent('order_id');
						this.sendMessage(content);
					}
					Toast2.fire({
						icon: 'success',
						title: 'Tạo đơn hàng thành công'
					});

					// Xóa giỏ hàng sau khi tạo đơn
					this.handleDeleteAllCart();
				} else {
					Toast.fire({
						icon: 'error',
						title: 'Đã xảy ra lỗi'
					})
					this.preventClick = false;
				}
	    	} catch(error) {
	    		if (error.data.error_message.message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message.message
					})
					this.preventClick = false;
					return;
	    		}
	    		if (error.data.error_message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message
					})
					this.preventClick = false;
					return;
	    		}

				if (error.errors) {
					Toast2.fire({
						icon: 'error',
						title: error.errors
					});
					this.preventClick = false;
					return;
				}

	    		console.log('error', error);
	    		Toast2.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
				this.preventClick = false;
	    	}
		},
		async createHaravanCustomer( body) {
			try {
				let path = `${this.basePath}other/haravan_create_customer`;
				console.log('haraas')
				let customer = {
					"customer_name": this.name,
					"customer_email": this.email,
					"customer_address": this.address,
					"customer_phone": this.phone,
					"customer_province_name": this.city.name,
					"customer_city_name": this.city.name,
					"access_token": this.appToken
				}
				let createCustomer = await Restful.post( path, customer);
				console.log('hrv acc success')
				path = `${this.basePath}order/order_create_3rd`;
				this.callOrder( path, body)
			} catch (e) {
				console.log('eeer', e.data.error_message)
				if (e && e.data && e.data.error_message === 'Địa chỉ Email đã được sử dụng.') {
					let path = `${this.basePath}order/order_create_3rd`;
					let body = {
			    		"access_token" : this.appToken,
					    "product_info": this.cart,
					    "customer_name": this.name,
					    "customer_phone": this.phone,
					    "customer_email": this.email,
					    "customer_address": this.address,
					    "customer_city_name": this.city.name,
					    "customer_province_name": this.city.name,
					    "customer_district_name": this.district.name,
					    "customer_ward_name": this.ward.name,
					    "customer_street_name": this.street,
					    "note": this.note,
						"status": "unconfirmed",
					    "platform_type": this.platformType,
					    "branchId": this.branch.id
		    		}
		    		if (!body.branchId) delete body.branchId;
		    		if (!this.city.name.includes('Tỉnh')) {
		    			delete body["customer_province_name"]
		    		}
					this.callOrder( path, body)
					return;
				}
				if (e && e.data && e.data.error_message) {
					Toast2.fire({
						icon: 'error',
						title: e.data.error_message
					});
					this.preventClick = false;
					return;
				}
				Toast2.fire({
					icon: 'error',
					title: 'Xảy ra lỗi khi tạo Haravan customer'
				})
				this.preventClick = false;
			}
		},
	    async handleDeleteAllCart() {
	    	try {

	    		// Xóa giỏ hàng sau khi tạo thành cong đơn hàng
	    		let path = this.basePath + 'cart/cart_delete';
	    		let body = {
	    			"access_token" : this.appToken,
    				"client_id": this.clientId
	    		}
	    		let postDeleteAllCart = await Restful.post( path, body);
	    		this.note = '';

	    		// Bỏ chặn click nút 'Xác nhận'
    			this.preventClick = false;

	    		this.getCart();

	    		// Đóng chi tiết đơn hàng
	    		this.closeOrderInfo();
	    	} catch {
	    		console.log('error', error);
	    	}
	    },
	    covertMsgContent(orderId) {
	    	localStorage.setItem('msg_content', this.msgContent);
	    	return this.msgContent.replace(/{{order_id}}/g, orderId);
	    },
	    async sendMessage(content) {
	    	try {
				let listProduct = this.cart.map(item => {
					return `${item.product_quantity}  ${item.product_name} \n`;
				})
				let strProduct = listProduct.join(' ');

	    		let path = `https://api.botbanhang.vn/v1.3/public/json`;
				let params = {
					"access_token": this.msgToken,
					"psid": this.msgClientId
				}
	    		let body = {
					 	messages: [
					   		{text: content},
							{text: `Tên khách hàng: ${this.name} \nSố điện thoại: ${this.phone} \nEmail: ${this.email} \nĐịa chỉ: ${this.address}`},
							{text: `Danh sách sản phẩm: \n${strProduct} \nTổng giá trị đơn hàng: \n${this.$options.filters.toCurrency(this.totalPrice)}`}
					 	]
					}
	    		let message = await Restful.post(path, body, params);
	    		console.log('send', body);
	    	} catch (e) {
	    		console.log('error send mess', e)
	    	}
	    },
	    closeOrderInfo() {
	    	this.isShowOrderInfo = false;
	    },
		async getListProduct(params) {
			try {
				let path = `${this.basePath}product/product_read`;

				// Load danh sách sản phẩm
				let getListProduct = await Restful.get( path, params);
				if (getListProduct.data && getListProduct.data.data) {
					this.listProduct = getListProduct.data.data;
				}
				if (getListProduct.data && getListProduct.data.data[0] && getListProduct.data.data[0].platform_type) {
					this.platformType = getListProduct.data.data[0].platform_type;
				}
				console.log(this.platformType)

				// Lấy chi nhánh nếu là Kiotviet
				if (this.platformType === 'KIOTVIET') {
					!this.hasBranch && this.getBranchKiotviet();
				}

				// Convert data theo variant nếu là Haravan và Sapo
				if (this.platformType === 'HARAVAN' || this.platformType === 'SAPO') {
					this.convertProductData();
				}
			} catch(e) {
				console.log('get product err', e)
			}
		},
		convertProductData() {
			let products = [].concat(this.listProduct);
			this.listProduct = [];

			let findImage = (product, imageId) => {
				if (product.images) {
					product.images.map(image => {
						if (image.id === imageId) {
							return image.src;
						}
					})
				}
				return product.image;
			}

			products.map((product, ind) => {
				let mapVariant = product.variants.map(variant => {
					variant.image = findImage(product, variant.image_id);
					return ({
						product_id: variant.id,
						product_name: product.product_name,
						product_price: variant.price,
						product_option: variant.title,
						image: variant.image
					})
				})
				this.listProduct = this.listProduct.concat(mapVariant);
			})
		},
	    async getInitialData() {

	    	if (localStorage.getItem('client_id')) {
	    		this.clientId = localStorage.getItem('client_id');
	    	}
	    	if (localStorage.getItem('msg_content')) {
	    		this.msgContent = localStorage.getItem('msg_content');
	    	}

      		let getListCity = await Restful.get('https://ext.botup.io/v1/delivery/subvn/thongtin/tinhtp', {})
			this.listCity = getListCity.data.data;

			this.getListProduct({ access_token: this.appToken });
			// Load giỏ hàng
			this.getCart();
	    },
	    async getBranchKiotviet() {
	    	try {
	    		let path = `${this.basePath}other/kiotviet_get_branch`;
	    		let body = {
	    			access_token: this.appToken
	    		}

	    		// Lấy danh sách chi nhánh Kiotviet
	    		let getBranch = await Restful.post(path, body);
	    		this.listBranch = getBranch.data.data.data;
	    		this.hasBranch = true;
	    	} catch(e) {
	    		if (e.data.error_message.message) {
	    			Toast2.fire({
						icon: 'error',
						title: e.data.error_message.message
					})
					return;
	    		}
	    		Toast2.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
	    		console.log('get branch err', e)
	    	}
	    },
	    showSettingMsg() {
	    	this.isShowSettingMsg = !this.isShowSettingMsg;
	    },
		async getOrderInfo(id) {

			// Reset clientId tránh loạn giỏ hàng
			this.clientId = '';
			localStorage.removeItem('client_id');
			this.cart = [];

			let path = `${this.basePath}order/order_read`;
			let params = {
				access_token: this.appToken,
				id
			}
			let order = await Restful.get( path, params);

			let dataOrder = {}
			if (order.data && order.data.data) {

				this.isUpdateOrder = true;

				dataOrder = order.data.data;
				this.name = dataOrder.customer_name;
				this.phone = dataOrder.customer_phone;
				this.email = dataOrder.customer_email;
				this.street = dataOrder.customer_street_name;
				this.note = dataOrder.note;
				this.country = 'Việt Nam';
				this.platformType = dataOrder.platform_type;
				this.orderId = dataOrder.id;

				if (dataOrder.branchId) {
					this.branchId = dataOrder.branchId;
				}
				this.listCity.map( item => {
					if (dataOrder.customer_city_name === item.name) {
						this.city = item;
					}
				})
				if (dataOrder.customer_city_name === '') {
					this.city = {}
					this.district = {}
					this.ward = {}
					return
				}

				await this.handleChooseCity();
				this.listDistrict.map( item => {
					if (dataOrder.customer_district_name === item.name) {
						this.district = item;
					}
				})

				await this.handleChooseDistrict();
				this.listWard.map( item => {
					if (dataOrder.customer_ward_name === item.name) {
						this.ward = item;
					}
				})
				console.log('call order', order);
			}
		},
		async createEmptyOrder() {
			try {

				// Tạo order rỗng
				if (this.platformType !== 'CUSTOM') return;
				let path = `${this.basePath}order/order_create_3rd`;
	    		let body = {
		    		"access_token" : this.appToken,
				    "customer_name": this.name,
				    "customer_phone": this.phone,
				    "customer_address": 'Chưa xác định',
					"status": "unconfirmed",
				    "platform_type": this.platformType
	    		}

				let emptyOrder = await Restful.post( path, body);
				if (emptyOrder.data && emptyOrder.data.data) {
					console.log('create empty order ok')
					this.orderId = emptyOrder.data.data.id;
					EventBus.$emit('call-order');
					Toast2.fire({
						icon: 'success',
						title: 'Tạo đơn hàng thành công'
					});

				} else {
					Toast.fire({
						icon: 'error',
						title: 'Đã xảy ra lỗi'
					})
				}
			} catch (error) {
				if (error.data.error_message.message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message.message
					})
					return;
	    		}
	    		if (error.data.error_message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message
					})
					return;
	    		}
				if (error.errors) {
					Toast2.fire({
						icon: 'error',
						title: error.errors
					});
					return;
				}
	    		Toast2.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
			}
		},
		async updateOrder() {
			try {
				this.preventClick = true;

				let path = `${this.basePath}order/order_update`;
				let body = {
		    		"access_token" : this.appToken,
					"id": this.orderId,
				    "product_info": this.cart,
				    "customer_name": this.name,
				    "customer_phone": this.phone,
				    "customer_email": this.email,
				    "customer_address": this.address,
				    "customer_city_name": this.city.name,
				    "customer_province_name": this.city.name,
				    "customer_district_name": this.district.name,
				    "customer_ward_name": this.ward.name,
				    "customer_street_name": this.street,
				    "note": this.note,
					"status": "confirmed"
	    		}
	    		if (!this.city.name.includes('Tỉnh')) {
	    			delete body["customer_province_name"]
	    		}
				let callUpdateOrder = await Restful.post( path, body);
				if (callUpdateOrder.data && callUpdateOrder.data.data) {

					this.isUpdateOrder = false;
					console.log('before')
					// Yêu cầu ListOrder.vue get list order
					EventBus.$emit('call-order');
					console.log('after')

					// Đẩy tin nhắn về Msg
					if (callUpdateOrder.data.data.order_id) {
						let content = this.covertMsgContent(callUpdateOrder.data.data.order_id);
						this.sendMessage(content);
					} else {
						let content = this.covertMsgContent('order_id');
						this.sendMessage(content);
					}

					localStorage.removeItem('cus_phone')

					Toast2.fire({
						icon: 'success',
						title: 'Cập nhật đơn hàng thành công'
					});

					this.$emit('switch-header');
					// Xóa giỏ hàng sau khi tạo đơn
					this.handleDeleteAllCart();
				} else {
					Toast.fire({
						icon: 'error',
						title: 'Đã xảy ra lỗi'
					})
					this.preventClick = false;
				}

			} catch (error) {
				if (error.data.error_message.message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message.message
					})
					this.preventClick = false;
					return;
	    		}
	    		if (error.data.error_message) {
	    			Toast2.fire({
						icon: 'error',
						title: error.data.error_message
					})
					this.preventClick = false;
					return;
	    		}

				if (error.errors) {
					Toast2.fire({
						icon: 'error',
						title: error.errors
					});
					this.preventClick = false;
					return;
				}

	    		Toast2.fire({
					icon: 'error',
					title: 'Đã xảy ra lỗi'
				})
				this.preventClick = false;
			}
		}
	},
	created() {
		EventBus.$on('get-order', id => {
			this.getOrderInfo(id);
		})
		EventBus.$on('create-empty-order', () => {
			if (!this.platformType) {
				this.waitToCreateEmptyOrder = true;
				return
			};
			this.createEmptyOrder();
		})
		EventBus.$on('disable-update-order', () => {
			this.isUpdateOrder = false;
		})
		if (this.appToken) {
			this.getInitialData();
			this.name = this.nameProp;
			this.phone = this.phoneProp;
			this.email = this.emailProp;
		}
	},
	beforeDestroy() {
		EventBus.$off('get-order');
		EventBus.$off('create-empty-order');
		EventBus.$off('disable-update-order');
	},
	watch: {
		appToken() {
			this.getInitialData();
			this.name = this.nameProp;
			this.phone = this.phoneProp;
			this.email = this.emailProp;
		},
		platformType() {
			if (this.waitToCreateEmptyOrder) {
				this.createEmptyOrder();
			}
		}
	},
	filters: {
		// Convert số sang vnd
		toCurrency(value) {
		    if (typeof value !== "number") {
		        return value;
		    }
		    var formatter = new Intl.NumberFormat('de-DE', {
		        style: 'currency',
		        minimumFractionDigits: 0,
		        currency: 'VND'
		    });
		    return formatter.format(value);
    	}
	}
}
</script>

<style scoped>

	input,
	textarea,
	select {
		width: 100%;
		border: none;
		background: #eee;
	}
	input:focus,
	textarea:focus,
	select:focus {
		box-shadow: none;
		background: #eee;
	}
	option {
		background: #fff;
	}

	.app {
		overflow: hidden;
		position: relative;
	}
	.customer-info {
		position: relative;
		/* background: #eeea; */
		padding: 10px;
	}
	.customer-info p {
		font-weight: bold;
	}
	.customer-info > p:first-child {
		font-size: 1.4rem;
	}
	.customer-info input,
	.customer-info select {
		margin-bottom: 10px;
	}
	.customer-info .setting-msg {
		width: 27px;
		height: 27px;
		position: absolute;
		top: 10px;
		right: 15px;
		cursor: pointer;
	}
	.customer-info .setting-msg-area {
		height: 0;
		width: 100%;
	}
	.customer-info .show {
		height: initial;
	}
	.customer-info .setting-msg-area button {
		font-weight: bold;
	}
	.product {
		padding: 0 10px;
	}
	.product .option img {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}
	.product .option p {
		cursor: pointer;
	}
	.product .option + .form-group {
		height: 0;
		opacity: 0;
		margin: 0;
		transition: all 0.3s ease;
	}
	.product .option + .form-group button {
		font-weight: bold;
	}
	.product .option + .show-note {
		height: initial;
		opacity: 1;
	}
	.product .form-group .hide {
		display: none;
	}
	.product .list-product {
		margin-bottom: 150px;
	}
	.product .list-product .product-detail {
		padding: 15px 0 15px;
		position: relative;
	}
	.product .list-product .product-detail p {
		margin: 0;
	}
	.product .list-product .product-detail div:first-of-type {
		width: 33%;
	}
	.product .list-product .product-detail div .name {
		max-width: 100%;
		overflow: hidden;
		max-height: 40px;
  		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
	}
	.product .list-product .product-detail div p + p {
		overflow: hidden;
  		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: .6;
		cursor: pointer;
	}
	.product .list-product .product-detail > img {
		width: 40px;
		height: 40px;
		border-radius: 5px;
	}

	.product .list-product .product-detail .quantity {
		width: 45px;
		height: 30px;
	}
	.product .list-product .product-detail .quantity p {
		font-weight: bold;
	}
	.product .list-product .product-detail .quantity button {
		height: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.product .list-product .product-detail .quantity button:focus {
		box-shadow: none;
	}
	.product .list-product .product-detail .quantity img {
		width: 10px;
		height: 10px;
	}
	.product .list-product .product-detail .quantity button + button img {
		transform: rotate(180deg);
	}
	.product .list-product .product-detail .price {
		font-size: 1.1rem;
	}
	.product .list-product .product-detail .edit img {
		width: 15px;
		height: 15px;
		cursor: pointer;
		filter: invert(24%) sepia(80%) saturate(4235%) hue-rotate(342deg) brightness(96%) contrast(79%);
	}
	.order {
		background: #fff;
		position: fixed;
	    padding: 0 10px;
	    left: 0;
	    right: 0;
	    bottom: 0
	}
	.order .total-price p {
		font-weight: bold;
		font-size: 1.1rem;
	}
	.order button {
		font-weight: bold;
	}
	.prevent-click {
		pointer-events: none;
	}
	.popup {
		position: fixed;
		width: 100%;
		height: 0;
		top: 100%;
		left: 0;
		background: #fff;
		transition: all 0.3s ease;
	}
	.show-popup {
		height: 100vh;
		top: 0;
	}
	.popup > div:first-child {
		padding: 10px;
	}
	.popup .search {
		background: #f6f6f6;
	}
	.popup .hidden-search {
		display: none !important;
	}
	.popup .search img {
		width: 17px;
		height: 17px;
		filter: invert(48%) sepia(0%) saturate(21%) hue-rotate(179deg) brightness(108%) contrast(100%);
	}
	.popup .search input {
		padding: 0;
		border: none;
		background: transparent;
		height: 30px;
	}
	.popup .search input:focus {
		outline: none;
	}
	.popup div > button {
		width: 30px;
		height: 30px;
		background: #0000;
		border: none;
		padding: 0;
		position: relative;
    	left: 5px;
	}
	.popup div > button:focus {
		outline: none;
	}
	.popup div > button img {
		width: 100%;
		height: 100%;
		filter: invert(30%) sepia(96%) saturate(2052%) hue-rotate(198deg) brightness(99%) contrast(108%);
	}
	.popup .list-product {
		padding: 10px;
		max-height: calc(100% - 50px);
		overflow-y: scroll;
		position: relative;
	}
	.popup .list-product::-webkit-scrollbar {
		display: none;
	}
	.popup .list-product .product {
		position: relative;
		cursor: pointer;
		background: #fff;
		transition: transform 0.3s ease .2s, background 0.3s ease .2s;
	}
	.popup .list-product .product:hover {
		background: #ddd;
		transform: translateY(-7px) scale(1.05);
	}
	.popup .list-product .product:last-child::after {
		content: "";
		width: 100%;
		height: 15vh;
		position: absolute;
		bottom: 0;
		left: 0;
		transform: translateY(100%);
		background: #fff;
	}
	.popup .product img {
		width: 40px;
		height: 40px;
	}
	.popup .product p:first-child {
		margin: 0;
		font-weight: bold;
		opacity: .9;
	}
	.popup .product p:first-child + p {
	 	opacity: .6;
	}
	.popup .product p:last-child {
		font-size: 1.1rem;
		/* font-weight: bold; */
		margin: 0;
	}
	.order-info {
		position: fixed;
		bottom: 13%;
		left: 0;
		height: 0;
		width: 100%;
		opacity: 0;
		background: #fff;
		box-shadow: 0 0 20px 0 #0005;
		transition: bottom 0.3s ease-out;
		overflow: hidden;
		padding: 0;
		border-radius: 15px 15px 0 0;
	}
	.order-info p {
		text-align: center;
	}
	.order-info p:first-child {
		font-weight: bold;
		font-size: 1.1rem;
	}
	.order-info p:last-of-type {
		font-weight: bold;
	}
	.order-info button {
		font-weight: bold;
	}
	.order-info::-webkit-scrollbar {
		display: none;
	}
	.order-info .close {
		position: absolute;
		width: 30px;
		height: 30px;
		top: 10px;
		right: 10px;
		opacity: 1;
		border-radius: 50%;
	}
	.order-info .close:hover {
		opacity: 1 !important;
	}
	.order-info .close img {
		width: 22px;
		height: 22px;
		filter: invert(30%) sepia(96%) saturate(2052%) hue-rotate(198deg) brightness(99%) contrast(108%);
	}
	.order-info .close:focus {
		outline: none;
	}
	.show-order-info {
		bottom: 0;
		max-height: 90vh;
		overflow-y: scroll;
		height: initial;
		opacity: 1;
		padding: 10px;
	}
	.config {
		padding: 10px;
	}
	.config button {
		font-weight: bold;
	}
	.main div:first-child > button {
		font-weight: bold;
	}
</style>
