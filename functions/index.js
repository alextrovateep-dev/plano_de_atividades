const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

initializeApp();

const db = getFirestore();
const authAdmin = getAuth();

async function callerRole(uid) {
  const u = await db.collection('usuarios').doc(uid).get();
  if (u.exists) return u.data().role || '';
  const leg = await db.collection('users').doc(uid).get();
  return leg.exists ? leg.data().role || '' : '';
}

exports.definirSenhaUsuario = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticação necessária.');
  }

  const role = await callerRole(request.auth.uid);
  if (role !== 'superadmin' && role !== 'teep_admin') {
    throw new HttpsError('permission-denied', 'Sem permissão para alterar senhas.');
  }

  const { uid, password } = request.data || {};
  if (!uid || !password || String(password).length < 6) {
    throw new HttpsError('invalid-argument', 'Senha inválida (mínimo 6 caracteres).');
  }

  const targetSnap = await db.collection('usuarios').doc(uid).get();
  const targetRole = targetSnap.exists ? targetSnap.data().role : '';
  if (targetRole === 'superadmin' && role !== 'superadmin') {
    throw new HttpsError('permission-denied', 'Não pode alterar a senha de um superadmin.');
  }

  await authAdmin.updateUser(uid, { password: String(password) });
  return { ok: true };
});
