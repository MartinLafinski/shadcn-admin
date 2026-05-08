import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import {
  BingfengLogo,
  FengchaoLogo,
  FengfangLogo,
  FenghouLogo,
  FengmiLogo,
  FengqunLogo,
  FengwangjiangLogo,
  FengxianLogo,
  GongfengLogo,
  MafengLogo,
  MifengLogo,
  TianmiLogo,
  XianfengLogo,
  YoufengLogo,
} from '@/assets/logos'
import { LearnMore } from '@/components/learn-more'

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

function HexWrapperInner({ children }: { children: React.ReactNode }) {
  const hex =
    '[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]'
  return (
    <div className={`${hex} bg-white/20 p-1`}>
      <div className={hex}>{children}</div>
    </div>
  )
}

function HexWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className='relative inline-flex p-0'>
      <svg
        className='pointer-events-none absolute inset-0 h-full w-full'
        viewBox='0 0 32 32'
      >
        <polygon
          points='16,0 32,8 32,24 16,32 0,24 0,8'
          fill='none'
          stroke='white'
          strokeWidth='1'
        />
      </svg>
      <HexWrapperInner>{children}</HexWrapperInner>
    </span>
  )
}

function AuthLayout() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-e'>
        <div className='absolute inset-0 bg-slate-500' />
        {/*<Link*/}
        {/*  to='/'*/}
        {/*  className='relative z-20 flex items-center text-lg font-medium'*/}
        {/*>*/}
        {/*  <XianfengLogo className='size-16'/>*/}
        {/*  觅蜂智能采料*/}
        {/*</Link>*/}
        <div className='relative z-20 m-auto flex flex-col items-center gap-2'>
          <XianfengLogo className='size-64 opacity-80' />
          <p className='text-2xl font-semibold tracking-tight'>
            先蜂，细分行业的一站式 AI 新门户
          </p>
          <p className='text-sm'>
            <span className='text-sm opacity-70'>低人工，</span>
            <span className=''>免训练</span>
            <span className='text-sm opacity-70'>，轻量高能，低配可用，</span>
            <span className=''>零Token消耗</span>
          </p>
          <p className='text-sm'>
            <span className=''>基于本地小模型集</span>
            <span className='opacity-70'>
              {' '}
              湖量数据 AI 门户高性价比解决方案
            </span>
          </p>

          <p className='mt-20 text-sm'>
            <span className='text-base'>*</span>
            <span className='opacity-70'>
              {' '}
              星标意味着若对接了外部大模型，可能会产生额外的Token费用，请注意限制用量
            </span>
          </p>

          <div className='mt-20 space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <MifengLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-base leading-tight font-medium'>
                  1. 觅蜂采料平台
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  分布式多端自部署自愈，数据自动发现，自动收集，多管道处理
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <BingfengLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  2. 兵蜂数据治理
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  数据补全/清洗/脱敏/冲突检测，开放信息抽取，实体消歧归一，事件脉络提炼
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <GongfengLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  3. 工蜂数媒中台 *
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  数字媒体内容湖，全文/多维/多态检索，工蜂跟随蜂后指令对内容二创或精加工
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <FengwangjiangLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  4. 蜂王浆模型库
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  一站式行业多模型本地推理服务，支持嵌入和多模态，支持多种量化格式，支持扩展部署
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <FengmiLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  5. 蜂蜜知识库
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  实时更新的湖量数据知识库，知识图谱+混合检索，情报发现溯源，脉络时序推理与演进式自建模
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <FenghouLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  6. 蜂后数智中枢 *
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  多智能体协作和链路规划的B端行业管家，周期性评估蜂巢绩效，自动编排工蜂/码蜂工作任务
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <MafengLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  7. 码蜂智能体 *
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  跟随蜂后指令，固化功能性开发任务，仅消耗一次性开发Token，任务功能全周期零成本复用
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <YoufengLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  8. 蜂房能力工场
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  管理蜂后和工蜂所需的各种MCP/ACP/Skill/固化功能/外部能力接口，类似AI插件工场
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-20'>
                <HexWrapper>
                  <FengchaoLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
                </HexWrapper>
              </div>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  9. 蜂巢新门户
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  最终交付产品，可以是人机交互的App/小程序/网站/软件，亦或数据交互的数据流/数字内容
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <HexWrapper>
                <FengqunLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
              </HexWrapper>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  a. 蜂群流量投放
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  面向GEO/SEO/社交/内容平台的定向投放，[上线后才有需求，二期再说]
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <HexWrapper>
                <FengfangLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
              </HexWrapper>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  b. 蜂厢运维平台
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  系统健康与全链路监控，紧急避险与“刹车系统”，[早呢着，先人工顶着]
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <HexWrapper>
                <TianmiLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
              </HexWrapper>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  c. 蜜语行业助理
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  [是做成对话机器人？在线客服？数字员工？还是做成能力接口接入龙虾/海马？待排期]
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <HexWrapper>
                <FengxianLogo className='mt-0.5 size-12 shrink-0 p-2 invert' />
              </HexWrapper>
              <div className='space-y-1.5 pt-2'>
                <p className='text-sm leading-tight font-medium'>
                  d. 蜂线工作流
                </p>
                <p className='mt-0.5 text-xs leading-tight opacity-70'>
                  工作流编排能力外溢，可对接n8n/cozi/dify，[待排期，放后面，先n8n顶上]
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='relative z-20 mt-4'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>请登录您的账号进行操作</p>
            <footer className='text-sm'>使用邮箱/用户名和密码登录</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='relative mx-auto flex w-full flex-col items-center justify-center gap-4'>
          <LearnMore
            defaultOpen
            triggerProps={{
              className: 'absolute -top-12 end-0 sm:end-20 size-6',
            }}
            contentProps={{ side: 'top', align: 'end', className: 'w-auto' }}
          >
            欢迎登录智蛛系统 <br />
            返回{' '}
            <Link
              to='/'
              className='underline decoration-dashed underline-offset-2'
            >
              控制台
            </Link>{' '}
            ?
          </LearnMore>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
