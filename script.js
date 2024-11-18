// 初始化全局变量
let records = [];

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializeRecords();
});

// 初始化记录
function initializeRecords() {
    try {
        const savedRecords = localStorage.getItem('records');
        if (savedRecords) {
            records = JSON.parse(savedRecords);
        }
        displayRecords();
        updateStatistics();
    } catch (error) {
        console.error('初始化记录失败:', error);
        records = [];
    }
}

// 个人信息管理
function uploadAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('avatar').src = event.target.result;
                profile.avatar = event.target.result;
                saveProfile();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function saveProfile() {
    profile.nickname = document.getElementById('nickname').value;
    profile.interests = document.getElementById('interests').value;
    localStorage.setItem('profile', JSON.stringify(profile));
    showToast('个人信息已保存');
}

function loadProfile() {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
        document.getElementById('nickname').value = profile.nickname;
        document.getElementById('interests').value = profile.interests;
        document.getElementById('avatar').src = profile.avatar;
    }
}

// 背景管理
function changeBg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.body.style.backgroundImage = `url('${e.target.result}')`;
            localStorage.setItem('background-image', e.target.result);
            showToast('背景已更新');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 谷物记录管理
function showAddRecordForm() {
    const form = `
        <div class="record-form">
            <h3>新增记录</h3>
            <form id="recordForm" onsubmit="handleFormSubmit(event)">
                <input type="text" id="product-name" placeholder="产品名称" required>
                <input type="number" id="product-price" placeholder="价格" required>
                <input type="date" id="purchase-date" required>
                <input type="text" id="purchase-channel" placeholder="购买渠道">
                <select id="product-category" required>
                    <option value="">选择分类</option>
                    <option value="色纸">色纸</option>
                    <option value="吧唧">吧唧</option>
                    <option value="娃娃">娃娃</option>
                    <option value="摆件">摆件</option>
                    <option value="挂饰">挂饰</option>
                    <option value="拍立得">拍立得</option>
                    <option value="香薰">香薰</option>
                    <option value="抱枕">抱枕</option>
                    <option value="相卡">相卡</option>
                    <option value="透卡">透卡</option>
                    <option value="其他">其他分类</option>
                </select>
                <select id="product-character" required>
                    <option value="">选择角色</option>
                    <option value="李泽言">李泽言</option>
                    <option value="周棋洛">周棋洛</option>
                    <option value="白起">白起</option>
                    <option value="凌肖">凌肖</option>
                    <option value="许墨">许墨</option>
                    <option value="其他">其他角色</option>
                </select>
                <input type="text" id="product-tags" placeholder="标签（用逗号分隔）">
                <textarea id="product-notes" placeholder="备注"></textarea>
                <input type="file" id="product-image" accept="image/*">
                <div class="form-buttons">
                    <button type="submit">保存</button>
                    <button type="button" onclick="cancelAdd()">取消</button>
                </div>
            </form>
        </div>
    `;
    document.querySelector('.records-list').insertAdjacentHTML('afterbegin', form);
}

// 处理表单提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        id: Date.now(),
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        date: document.getElementById('purchase-date').value,
        channel: document.getElementById('purchase-channel').value,
        category: document.getElementById('product-category').value,
        character: document.getElementById('product-character').value,
        tags: document.getElementById('product-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
        notes: document.getElementById('product-notes').value
    };

    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.image = e.target.result;
            saveRecordToStorage(formData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveRecordToStorage(formData);
    }
}

// 保存记录到存储
function saveRecordToStorage(record) {
    try {
        records.push(record);
        localStorage.setItem('records', JSON.stringify(records));
        displayRecords();
        updateStatistics();
        document.querySelector('.record-form').remove();
        alert('记录保存成功！');
    } catch (error) {
        console.error('保存记录失败:', error);
        alert('保存失败，请重试');
    }
}

function loadRecords() {
    const savedRecords = localStorage.getItem('records');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        displayRecords();
    }
}

function displayRecords() {
    const recordsList = document.getElementById('records-list');
    recordsList.innerHTML = records.map(record => `
        <div class="record-item" data-id="${record.id}">
            ${record.image ? `<img src="${record.image}" alt="产品图片" class="record-image">` : ''}
            <div class="record-info">
                <h3>${record.name}</h3>
                <p>价格: ¥${record.price}</p>
                <p>购买日期: ${record.date}</p>
                <p>购买渠道: ${record.channel || '未填写'}</p>
                <p>分类: ${record.category}</p>
                <p>角色: ${record.character}</p>
                <p>标签: ${record.tags.join(', ')}</p>
                ${record.notes ? `<p>备注: ${record.notes}</p>` : ''}
            </div>
            <button onclick="deleteRecord(${record.id})">删除</button>
        </div>
    `).join('');
}

function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        records = records.filter(record => record.id !== id);
        localStorage.setItem('records', JSON.stringify(records));
        displayRecords();
        updateStatistics();
        showToast('记录已删除');
    }
}

function cancelAdd() {
    document.querySelector('.record-form').remove();
}

// 搜索和筛选
function searchRecords() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredRecords = records.filter(record => 
        record.name.toLowerCase().includes(searchTerm) ||
        record.category.toLowerCase().includes(searchTerm) ||
        record.character.toLowerCase().includes(searchTerm) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    displayRecords(filteredRecords);
}

function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const character = document.getElementById('character-filter').value;
    const date = document.getElementById('date-filter').value;
    const minPrice = document.getElementById('price-min').value;
    const maxPrice = document.getElementById('price-max').value;

    const filteredRecords = records.filter(record => {
        const matchCategory = !category || record.category === category;
        const matchCharacter = !character || record.character === character;
        const matchDate = !date || record.date === date;
        const matchPrice = (!minPrice || record.price >= minPrice) && 
                         (!maxPrice || record.price <= maxPrice);
        
        return matchCategory && matchCharacter && matchDate && matchPrice;
    });

    displayRecords(filteredRecords);
}

// 统计分析
function updateStatistics() {
    const totalExpense = records.reduce((sum, record) => sum + record.price, 0);
    document.getElementById('total-expense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('total-items').textContent = records.length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpense = records.reduce((sum, record) => {
        const recordDate = new Date(record.date);
        if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
            return sum + record.price;
        }
        return sum;
    }, 0);
    document.getElementById('monthly-expense').textContent = `¥${monthlyExpense.toFixed(2)}`;

    updateCharts();
}

// 图表更新
function updateCharts() {
    updateExpenseChart();
    updateCategoryChart();
}

function updateExpenseChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    const data = getExpenseChartData();
    
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }
    
    window.expenseChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '月度支出趋势'
                }
            }
        }
    });
}

function updateCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    const data = getCategoryChartData();
    
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '分类支出占比'
                }
            }
        }
    });
}

function getExpenseChartData() {
    const months = [];
    const expenses = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months.push(monthYear);
        
        const monthlyExpense = records.reduce((sum, record) => {
            const recordDate = new Date(record.date);
            if (recordDate.getFullYear() === date.getFullYear() && 
                recordDate.getMonth() === date.getMonth()) {
                return sum + record.price;
            }
            return sum;
        }, 0);
        
        expenses.push(monthlyExpense);
    }

    return {
        labels: months,
        datasets: [{
            label: '月度支出',
            data: expenses,
            borderColor: '#3498db',
            tension: 0.1
        }]
    };
}

function getCategoryChartData() {
    const categoryExpenses = {};
    records.forEach(record => {
        if (categoryExpenses[record.category]) {
            categoryExpenses[record.category] += record.price;
        } else {
            categoryExpenses[record.category] = record.price;
        }
    });

    return {
        labels: Object.keys(categoryExpenses),
        datasets: [{
            data: Object.values(categoryExpenses),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
                '#FFCE56', '#4BC0C0'
            ]
        }]
    };
}

// 提示信息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }, 100);
}

// 初始化背景
document.addEventListener('DOMContentLoaded', function() {
    const savedBg = localStorage.getItem('background-image');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }
}); 