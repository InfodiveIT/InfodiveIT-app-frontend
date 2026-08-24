import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { StaticImageData } from 'next/image'
import { ClientsStage } from '@/sections/home/clients-stage'
import acao from '../../client-logos-ready/acao-sistemas.webp'
import topazio from '../../client-logos-ready/banco-topazio.webp'
import getnet from '../../client-logos-ready/getnet.webp'
import ghc from '../../client-logos-ready/ghc.webp'
import mundial from '../../client-logos-ready/mundial-sa.webp'
import olfar from '../../client-logos-ready/olfar.webp'
import panvel from '../../client-logos-ready/panvel.webp'
import peccin from '../../client-logos-ready/peccin.webp'
import saqueEPague from '../../client-logos-ready/saque-e-pague.webp'
import sementesEstrela from '../../client-logos-ready/sementes-estrela.webp'
import sicredi from '../../client-logos-ready/sicredi.webp'
import stihl from '../../client-logos-ready/stihl.webp'

function imageUrl(image: StaticImageData | string) {
  return typeof image === 'string' ? image : image.src
}

const clients = [
  ['Banco Topázio', 'Serviços financeiros', 'Banco digital B2B de câmbio, crédito e BaaS.', topazio],
  ['Sicredi', 'Cooperativismo financeiro', 'Cooperativismo financeiro que fortalece pessoas e comunidades.', sicredi],
  ['Peccin', 'Alimentos', 'Indústria de chocolates, balas, chicles e wafers.', peccin],
  ['Panvel', 'Saúde e varejo', 'Saúde, beleza e bem-estar em farmácias e canais digitais.', panvel],
  ['Mundial S.A.', 'Indústria e consumo', 'Indústria brasileira de bens de consumo e grandes marcas.', mundial],
  ['STIHL', 'Equipamentos', 'Ferramentas motorizadas para o trabalho junto à natureza.', stihl],
  ['Ação Sistemas', 'Tecnologia', 'Tecnologia e sistemas para gestão de recursos humanos.', acao],
  ['Getnet', 'Pagamentos', 'Tecnologia e soluções de pagamento para todos os negócios.', getnet],
  ['Saque e Pague', 'Serviços financeiros', 'Rede de autoatendimento e soluções financeiras.', saqueEPague],
  ['GHC', 'Saúde pública', 'Rede pública de saúde com atendimento integral e 100% SUS.', ghc],
  ['OLFAR', 'Agroindústria e energia', 'Agroindústria de soja, grãos, biodiesel e energia.', olfar],
  ['Sementes Estrela', 'Agronegócio', 'Sementes de soja e trigo com tecnologia e alta performance.', sementesEstrela],
].map(([nome, segmento, descricaoCurta, logo], index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  nome: String(nome),
  segmento: String(segmento),
  descricaoCurta: String(descricaoCurta),
  logoUrl: imageUrl(logo as StaticImageData),
  ordem: index + 1,
}))

const meta = {
  title: 'Home/Clientes Stage',
  component: ClientsStage,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
  args: {
    clients,
    eyebrow: 'Clientes',
    headline: 'Tecnologia que sustenta parcerias duradouras',
    subtitle: 'Organizações de diferentes setores que fazem parte da história da Infodive.',
  },
} satisfies Meta<typeof ClientsStage>

export default meta
type Story = StoryObj<typeof meta>

export const Completa: Story = {}

export const SeisClientes: Story = {
  args: { clients: clients.slice(0, 6) },
}

