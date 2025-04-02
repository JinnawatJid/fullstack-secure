async function fetchUsers() {
    try {
        const response = await fetch('https://www.sweetiefruity.site/api/getUsers');
        const users = await response.json();

        console.log(users);  // Log the users to see what data you're receiving

        const tableBody = document.getElementById('user-table');
        tableBody.innerHTML = '';  // Clear the table before inserting new rows

        users.forEach(user => {
            const row = `<tr>
                <td>${user.userid}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}


async function fetchProduct() {
    try {
        const response = await fetch('https://www.sweetiefruity.site/getProduct');
        const product = await response.json();

        console.log(product); 

        const tableBody = document.getElementById('product-table');
        tableBody.innerHTML = ''; 

        product.forEach(pd => {
            const row = `<tr>
                <td>${pd.productid}</td>  <!-- Make sure this matches the database column name -->
                <td>${pd.productname}</td>
                <td>${pd.price}</td>
                <td>${pd.qty}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
        
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function loadData() {
    await fetchUsers();
    await fetchProduct();
  }
  
window.onload = loadData;