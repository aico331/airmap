/* eslint-disable no-undef */
// error code
const showError = (error) => {
  const position = {
    coords: {
      latitude: '23.8523405',
      longitude: '120.9009427'
    },
    zoom: 7
  }
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert('讀取不到您目前的位置')
      showPosition(position)
      break
    case error.POSITION_UNAVAILABLE:
      alert('讀取不到您目前的位置')
      showPosition(position)
      break
    case error.TIMEOUT:
      alert('讀取位置逾時')
      showPosition(position)
      break
    case error.UNKNOWN_ERROR:
      alert('Error')
      showPosition(position)
      break
  }
}

const showPosition = (position) => {
  const map = L.map('map').setView([position.coords.latitude, position.coords.longitude], position.zoom || 17)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // 創建icon圖標
  const greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const orangeIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const greyIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const blueMarker = L.icon.pulse({ iconSize: [20, 20], color: '#2e72f0', fillColor: '#2e72f0' })

  // 設定所在位置的icon
  const selfPos = L.marker([position.coords.latitude, position.coords.longitude], { icon: blueMarker }).bindPopup('目前位置')
  map.addLayer(selfPos)

  // 使用 MarkerClusterGroup 將各個地點群組化
  const markers = new L.MarkerClusterGroup()

  // 取得 AJAX 資料
  let data = []
  const xhr = new XMLHttpRequest()
  xhr.open('get', 'https://raw.githubusercontent.com/aico331/airmap/master/test1.json')
  xhr.send()
  xhr.onload = () => {
    data = JSON.parse(xhr.responseText).features
    data.forEach((item) => {
      let pin = ''
      if (item.properties.mask_adult === 0 && item.properties.mask_child === 0) {
        pin = greenIcon
      } else {pin = greenIcon
      }
      markers.addLayer(L.marker([item.geometry.coordinates[1], item.geometry.coordinates[0]], { icon: pin }).bindPopup(`
        <ul class="information">
            <li class="text-dark pharmacy">${item.properties.name}</li>
            <li class="text-dark address"><a href="https://www.google.com.tw/maps/place/${item.properties.address}"  target="_blank">${item.properties.address} <img src="img/規劃路徑.png" alt=""></a></li>
            
            <li class="mt-2">
                <div class="row maskNum no-gutters text-white">
                    <div class="col-6 bg-primary py-1" style="padding: 0 24px">
                        <p>AQI為</p>
                        <p class="d-flex align-items-end">
                            <span style="font-size:21px line-height:25px"">${item.properties.mask_adult}</span> 
                            
                        </p>
                    </div>
                    <div class="col-6 bg-warning py-1" style="padding: 0 24px">
                        <p>PM2.5為</p>
                        <p class="d-flex align-items-end">
                            <span style="font-size:21px line-height:25px">${item.properties.mask_child}</span>
                            
                        </p>
                    </div>
                </div>
            </li>
        </ul>`))
    })
    map.addLayer(markers)

    // 搜尋列
    const maskInfoList = document.querySelector('#js-maskInfoList')
    const searchBlock = document.querySelector('#js-searchBlock')
    const maskTypeOpt = document.querySelector('#js-maskTypeOpt')
    const searchBtn = document.querySelector('#js-searchBtn')
    const pharmacyNumText = document.querySelector('#js-pharmacyNum')

    const searchAddress = (e) => {
      if (e.keyCode === 13 || e.type === 'click') { // 同時可以按enter和clickBTN的方法
        let searchList = []
        const pharmacyStore = []
        if (searchBlock.value === '') {
          pharmacyNumText.textContent = '請輸入你要尋找的區域'
          return
        }

        const allSort = data.sort((a, b) => {
          const second = b.properties.mask_adult + b.properties.mask_child
          const first = a.properties.mask_adult + a.properties.mask_child
          return second - first
        })

        allSort.forEach(function (item) {
          if (item.properties.address.indexOf(searchBlock.value.trim()) !== -1) { // 模糊搜尋
            if (item.properties.mask_child !== 0 || item.properties.mask_adult !== 0) {
              if (maskTypeOpt.value === '全部') {
                pharmacyStore.push(item)
                const pharmacyNum = pharmacyStore.length
                const str = `
                  <ul class="information mt-3 js-info" data-lat="${item.geometry.coordinates[1]}" data-lng="${item.geometry.coordinates[0]}" style="cursor:pointer">
                      <li class="text-dark pharmacy">${item.properties.name}</li>
                      <li class="text-dark address">${item.properties.address}</li>
                      
                      <li class="mt-3">
                          <div class="row maskNum no-gutters text-white">
                              <div class="col-6 bg-primary px-2 py-2 d-flex justify-content-between">
                                  <p>AQI</p>
                                  
                              </div>
                              <div class="col-6 bg-warning px-2 py-2 d-flex justify-content-between">
                                  <p>PM2.5</p>
                                  
                              </div>
                          </div>
                      </li>
                  </ul>
                  `
                searchList += str
                pharmacyNumText.textContent = `共有${pharmacyNum}處測站`
              }
            }
          }
        })

        const childSort = data.sort((a, b) => {
          return b.properties.mask_child - a.properties.mask_child
        })

        childSort.forEach(function (item) {
          if (item.properties.address.indexOf(searchBlock.value.trim()) !== -1) { // 模糊搜尋
            if (item.properties.mask_child !== 0 || item.properties.mask_adult !== 0) {
              if (item.properties.mask_child !== 0 && maskTypeOpt.value === '兒童口罩') {
                pharmacyStore.push(item)
                const pharmacyNum = pharmacyStore.length
                const str = `
                          <ul class="information mt-3 js-info" data-lat="${item.geometry.coordinates[1]}" data-lng="${item.geometry.coordinates[0]}" style="cursor:pointer">
                              <li class="text-dark pharmacy">${item.properties.name}</li>
                              <li class="text-dark address">${item.properties.address}</li>
                              <li class="mt-3">
                                  <div class="row maskNum no-gutters text-white">
                                      <div class="col-12 bg-warning px-2 py-2 d-flex justify-content-between">
                                          <p>AQI</p>
                                          
                                      </div>
                                  </div>
                              </li>
                          </ul>
                          `
                searchList += str
                pharmacyNumText.textContent = `共有${pharmacyNum}處測站`
              }
            }
          }
        })

        const adultSort = data.sort((a, b) => {
          return b.properties.mask_adult - a.properties.mask_adult
        })

        adultSort.forEach(function (item) {
          if (item.properties.address.indexOf(searchBlock.value.trim()) !== -1) { // 模糊搜尋
            if (item.properties.mask_child !== 0 || item.properties.mask_adult !== 0) {
              if (item.properties.mask_adult !== 0 && maskTypeOpt.value === '成人口罩') {
                pharmacyStore.push(item)
                const pharmacyNum = pharmacyStore.length
                const str = `
                          <ul class="information mt-3 js-info" data-lat="${item.geometry.coordinates[1]}" data-lng="${item.geometry.coordinates[0]}" style="cursor:pointer">
                              <li class="text-dark pharmacy">${item.properties.name}</li>
                              <li class="text-dark address">${item.properties.address}</li>
                             
                              <li class="mt-3">
                                  <div class="row maskNum no-gutters text-white">
                                      <div class="col-12 bg-primary px-2 py-2 d-flex justify-content-between">
                                          <p>AQI</p>
                                          
                                      </div>
                                  </div>
                              </li>
                          </ul>
                          `
                searchList += str
                pharmacyNumText.textContent = `共有${pharmacyNum}處測站`
                console.log('成人')
              }
            }
          }
        })

        if (pharmacyStore.length === 0) {
          pharmacyNumText.textContent = '找不到這個關鍵字喔'
        } else {
          map.setView([pharmacyStore[0].geometry.coordinates[1], pharmacyStore[0].geometry.coordinates[0]], 15)
        }

        maskInfoList.innerHTML = searchList
        // 使地圖對應到搜尋相對應的位置

        if (searchList.length === 0) {
          pharmacyNumText.textContent = '您搜尋的關鍵字目前找不到測站'
        }

        // 點選藥局改變地圖位置pharmacyNumText
        const infoPointer = document.querySelectorAll('.js-info')
        pharmacyStore.forEach(function (item, key) {
          infoPointer[key].addEventListener('click', (e) => {
            Lat = e.currentTarget.dataset.lat
            Lng = e.currentTarget.dataset.lng
            searchBar.classList.remove('active')
            map.setView([Lat, Lng], 20)
          })
        })
      }
    }

    searchBtn.addEventListener('click', searchAddress)
    searchBlock.addEventListener('keydown', searchAddress)
    // 回到目前位置
    const goBackPosition = document.querySelector('.js-goBackPosition')
    goBackPosition.addEventListener('click', () => {
      map.setView([position.coords.latitude, position.coords.longitude], 17)
    })
  }
}

// 尋找目前定位
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, showError)
} else {
  alert('您的瀏覽器不支援定位系統')
  const position = {
    coords: {
      latitude: '23.8523405',
      longitude: '120.9009427'
    },
    zoom: 7
  }
  showPosition(position)
}

// 日期
const year = document.querySelector('.js-year')
const month = document.querySelector('.js-month')
const date = document.querySelector('.js-date')
const day = document.querySelector('.js-day')
const nextMonth = document.querySelector('.js-nextMonth')
const nextDate = document.querySelector('.js-nextDate')
const nextDay = document.querySelector('.js-nextDay')

const dt = new Date()

year.textContent = ' ' + dt.getFullYear()
month.textContent = dt.getMonth() + 1
date.textContent = dt.getDate()

const days = new Array(7)
days[0] = '七'
days[1] = '一'
days[2] = '二'
days[3] = '三'
days[4] = '四'
days[5] = '五'
days[6] = '六'

day.textContent = days[dt.getDay()]


// 設定可以買口罩的時間
const idCardSet = document.querySelector('#js-idCardSet')
const popBox = document.querySelector('#js-popBox')
const idNumBlock = document.querySelector('#js-idNumBlock')
const idSaveBtn = document.querySelector('#js-idSaveBtn')
const buyNews = document.querySelector('#js-buyNews')
const note = document.querySelector('#js-note')


// 控制 searchBar 滑入滑出
const mapBurgerBtn = document.querySelector('#js-map-burgerBtn')
const searchBurgerBtn = document.querySelector('#js-search-burgerBtn')
const searchBar = document.querySelector('.js-searchBar')

mapBurgerBtn.addEventListener('click', () => {
  searchBar.classList.add('active')
})

searchBurgerBtn.addEventListener('click', () => {
  searchBar.classList.remove('active')
})
