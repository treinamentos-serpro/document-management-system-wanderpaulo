async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
  }
  return response;
}

export async function listDocuments(signal) {
  const response = await request('/documents', { signal });
  return response.json();
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await request('/upload', { method: 'POST', body: form });
  return response.json();
}

export async function downloadDocument(document) {
  const response = await request(`/documents/${encodeURIComponent(document.id)}/download`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = document.originalName;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}