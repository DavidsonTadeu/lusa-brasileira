import emailjs from '@emailjs/browser';

// SUBSTITUA ESTAS STRINGS PELAS SUAS CHAVES DO EMAILJS
const SERVICE_ID = "service_a4nvzch"; 
const TEMPLATE_ID = "template_hjxglt9";
const PUBLIC_KEY = "m_gwAkI--BCVkIsrO";

export const sendPasswordRecoveryEmail = async (email, tempPassword, userName) => {
  try {
    const templateParams = {
      to_email: email,
      to_name: userName || "Cliente", // Se não tiver nome, usa "Cliente"
      temp_password: tempPassword,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log("Email enviado com sucesso!", response.status, response.text);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw new Error("Falha ao enviar o email. Tente novamente mais tarde.");
  }
};