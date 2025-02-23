import defaultUser from '../utils/default-user';


const baseURL = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token'); 

export async function signIn(email, password) {
  const url = `${baseURL}/auth/login`;

  // Prepare the JSON payload
  const body = {
    email: email,
    password: password,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return {
        isOk: true,
        data: data,  // API response data (user data or token)
      };
    } else {
      const errorData = await response.json();
      return {
        isOk: false,
        message: errorData.message || "Authentication failed",
      };
    }
  } catch (error) {
    return {
      isOk: false,
      message: error.message || "An error occurred during login",
    };
  }
}


export async function getUser() {
  try {
const token = localStorage.getItem('token');   
if(token){
    return {
      isOk: true,
      data: defaultUser
    };
  }
  else{
    return{
      isOk: false
    }
  }
}
  catch {
    return {
      isOk: false
    };
  }
}

export async function createAccount(email, password, firstName, lastName, phoneNumber, companyName, confirmPassword) {
  const url = `${baseURL}/creds/signup/`;  

  const body = new URLSearchParams();
  body.append('email', email);
  body.append('password', password);
  body.append('first_name', firstName);
  body.append('last_name', lastName);
  body.append('phone_number', phoneNumber);
  body.append('company_name', companyName);
  body.append('confirm_password', confirmPassword);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    // Check if the response is okay (status in the range 200-299)
    if (response.ok) {
      return {
        isOk: true
      };
    } else {
      const errorData = await response.json();
      return {
        isOk: false,
        message: errorData.message || "Failed to create account",
      };
    }
  } catch (error) {
    return {
      isOk: false,
      message: error.message || "An error occurred during account creation",
    };
  }
}


export async function changePassword(oldPassword, newPassword) {
  try {
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('old_password', oldPassword);
    formData.append('new_password', newPassword);

    // Send the PUT request to the API
    const response = await fetch(`${baseURL}/creds/update-password/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, // Pass the token in the header
        // 'Content-Type': 'application/x-www-form-urlencoded' // Form data encoding
      },
      body: formData
    });

    // Check if the response is OK (status 200 range)
    if (response.ok) {
      return {
        isOk: true
      };
    } else {
      const errorData = await response.json();
      return {
        isOk: false,
        message: errorData.message || "Failed to change password"
      };
    }
  } catch (error) {
    // Catch any errors during the request
    return {
      isOk: false,
      message: error.message || "Failed to change password"
    };
  }
}


export async function resetPassword(email) {
  const url = `${baseURL}/creds/reset-password/`;

  const body = new URLSearchParams();
  body.append('email', email);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    // Check if the response is okay (status in the range 200-299)
    if (response.ok) {
      return {
        isOk: true,
      };
    } else {
      const errorData = await response.json();
      return {
        isOk: false,
        message: errorData.message || "Failed to reset password",
      };
    }
  } catch (error) {
    return {
      isOk: false,
      message: error.message || "An error occurred while resetting password",
    };
  }
}
