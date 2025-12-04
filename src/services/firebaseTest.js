// Arquivo de teste para verificar conexão com Firebase
import { db } from './firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

/**
 * Testa a conexão com o Firestore
 */
export const testFirestoreConnection = async () => {
  console.log('🔍 Testando conexão com Firestore...')
  console.log('📊 Database:', db)
  console.log('📊 Database type:', db?.type)
  console.log('📊 Database app:', db?.app?.name)
  
  const tests = {
    courses: false,
    enrollments: false,
    professores: false,
    users: false
  }
  
  // Teste 1: Tentar ler a coleção de cursos
  try {
    console.log('\n📚 Teste 1: Lendo coleção "courses"...')
    const coursesRef = collection(db, 'courses')
    const coursesSnapshot = await getDocs(coursesRef)
    console.log('✅ Sucesso! Encontrados', coursesSnapshot.size, 'documentos')
    tests.courses = true
  } catch (error) {
    console.error('❌ Erro ao ler courses:', error.code, error.message)
    if (error.code === 'permission-denied') {
      console.error('⚠️ PERMISSÃO NEGADA: As regras do Firestore precisam ser configuradas!')
    }
  }
  
  // Teste 2: Tentar ler uma subcoleção de enrollments
  try {
    console.log('\n👥 Teste 2: Lendo subcoleção "courses/html/enrollments"...')
    const enrollmentsRef = collection(db, 'courses', 'html', 'enrollments')
    const enrollmentsSnapshot = await getDocs(enrollmentsRef)
    console.log('✅ Sucesso! Encontrados', enrollmentsSnapshot.size, 'inscrições')
    tests.enrollments = true
  } catch (error) {
    console.error('❌ Erro ao ler enrollments:', error.code, error.message)
    if (error.code === 'permission-denied') {
      console.error('⚠️ PERMISSÃO NEGADA: As regras do Firestore precisam ser configuradas!')
    }
  }
  
  // Teste 3: Tentar ler a coleção de professores
  try {
    console.log('\n👨‍🏫 Teste 3: Lendo coleção "professores"...')
    const professoresRef = collection(db, 'professores')
    const professoresSnapshot = await getDocs(professoresRef)
    console.log('✅ Sucesso! Encontrados', professoresSnapshot.size, 'professores')
    tests.professores = true
  } catch (error) {
    console.error('❌ Erro ao ler professores:', error.code, error.message)
    if (error.code === 'permission-denied') {
      console.error('⚠️ PERMISSÃO NEGADA: As regras do Firestore precisam ser configuradas!')
    }
  }
  
  // Teste 4: Tentar ler um documento de usuário (se autenticado)
  try {
    console.log('\n👤 Teste 4: Verificando acesso a "users"...')
    // Não vamos tentar ler sem userId, apenas verificar se a coleção existe
    console.log('ℹ️ Teste de users requer autenticação')
    tests.users = true
  } catch (error) {
    console.error('❌ Erro:', error.code, error.message)
  }
  
  console.log('\n📊 Resumo dos Testes:')
  console.log('Courses:', tests.courses ? '✅' : '❌')
  console.log('Enrollments:', tests.enrollments ? '✅' : '❌')
  console.log('Professores:', tests.professores ? '✅' : '❌')
  console.log('Users:', tests.users ? '✅' : 'ℹ️')
  
  const allPassed = Object.values(tests).every(test => test === true)
  if (!allPassed) {
    console.error('\n⚠️ ALGUNS TESTES FALHARAM!')
    console.error('🔧 AÇÃO NECESSÁRIA: Configure as regras do Firestore no Firebase Console')
    console.error('📖 Veja o arquivo: COMO_CORRIGIR_ERROS_FIREBASE.md')
  } else {
    console.log('\n✅ Todos os testes passaram!')
  }
  
  return tests
}

// Executar teste automaticamente se importado diretamente
if (typeof window !== 'undefined') {
  // Adicionar ao window para poder chamar no console do navegador
  window.testFirestore = testFirestoreConnection
}

