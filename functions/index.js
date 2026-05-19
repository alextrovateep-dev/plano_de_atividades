const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

async function callerRole(uid) {
  const u = await admin.firestore().collection('usuarios').doc(uid).get();
  if (u.exists) return u.data().role || '';
  const leg = await admin.firestore().collection('users').doc(uid).get();
  return leg.exists ? leg.data().role || '' : '';
}

exports.definirSenhaUsuario = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Autenticação necessária.');
  }

  const role = await callerRole(context.auth.uid);
  if (role !== 'superadmin' && role !== 'teep_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão para alterar senhas.');
  }

  const { uid, password } = data || {};
  if (!uid || !password || String(password).length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Senha inválida (mínimo 6 caracteres).');
  }

  const targetSnap = await admin.firestore().collection('usuarios').doc(uid).get();
  const targetRole = targetSnap.exists ? targetSnap.data().role : '';
  if (targetRole === 'superadmin' && role !== 'superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'Não pode alterar a senha de um superadmin.');
  }

  await admin.auth().updateUser(uid, { password: String(password) });
  return { ok: true };
});
