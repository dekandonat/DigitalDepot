export async function apiFetch(url, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    let settings = {
      method: options.method || 'GET',
      headers: {
        ...options.headers,
      },
    };

    if (token) {
      settings.headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      settings.headers['Content-Type'] = 'application/json';
    }

    if (options.body !== undefined) {
      settings.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    let response = await fetch(url, settings);

    if (response.status == 401) {
      if (!localStorage.getItem('token')) {
        throw new Error('Unauthorized');
      }

      const rawRefreshData = await fetch('/user/refresh', {
        credentials: 'include',
      });
      const refreshData = await rawRefreshData.json();

      if (refreshData.result === 'success') {
        localStorage.setItem('token', refreshData.data);

        const newIsFormData = options.body instanceof FormData;

        let newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshData.data}`,
          },
        };
        if (!newIsFormData) {
          newOptions.headers['Content-Type'] = 'application/json';
        }
        if (options.body !== undefined) {
          newOptions.body = newIsFormData
            ? options.body
            : JSON.stringify(options.body);
        }

        response = await fetch(url, newOptions);
      } else {
        localStorage.clear();
        window.location.replace('/');
        throw new Error('A munkamenet lejárt, kérjük jelentkezzen be újra');
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (err) {
        errorData = { message: response.statusText };
      }
      const error = new Error(errorData.message || 'Hiba történt');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    throw new Error('Hiba: ' + err.message);
  }
}
