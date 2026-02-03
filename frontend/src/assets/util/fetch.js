export async function apiFetch(url, options = {}) {
  try {
    let settings = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body !== undefined) {
      settings.body = JSON.stringify(options.body);
    }

    let response = await fetch(url, settings);

    if (response.status == 401) {
      const rawRefreshData = await fetch('/user/refresh');
      const refreshData = await rawRefreshData.json();

      if (refreshData.result === 'success') {
        localStorage.setItem('token', refreshData.data);

        let newOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshData.data}`,
          },
        };

        if (options.body !== undefined) {
          newOptions.body = JSON.stringify(options.body);
        }

        response = await fetch(url, newOptions);
      } else {
        throw new Error('Jelentkezzen be újra!');
      }
    }

    if (!response.ok) {
      throw new Error('Hiba: ' + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error('Hiba: ' + err.message);
  }
}
