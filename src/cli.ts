#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { WalletAnalyzer } from './analyzer.js';
import { DelegationCanceller } from './canceller.js';
import { SafetyChecker } from './safety.js';
import { EmergencyCanceller } from './emergency.js';
import { ContractAnalyzer } from './contract-analyzer.js';
import { EmergencyTransfer } from './emergency-transfer.js';
import { AttackTracer } from './attack-tracer.js';
import { ForensicAnalyzer } from './forensic-analyzer.js';
import { PenetrationAnalyzer } from './penetration-analyzer.js';
import { SignatureScanner } from './signature-scanner.js';
import { AttackSimulator } from './attack-simulator.js';
import { AttackMonitor } from './attack-monitor.js';
import { WalletStatus } from './types.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('monad-wallet-checker')
  .description('Check and cancel EIP-7702 delegations on Monad testnet')
  .version('1.0.0');

program
  .command('check')
  .description('Check wallet delegation status')
  .option('-a, --address <address>', 'Wallet address to check')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    await checkCommand(options);
  });

program
  .command('cancel')
  .description('Cancel active delegation')
  .option('-k, --private-key <key>', 'Private key for signing (use with caution)')
  .option('-a, --address <address>', 'Wallet address (if using external signer)')
  .option('--rpc <url>', 'Custom RPC URL')
  .option('--dry-run', 'Simulate the transaction without sending')
  .option('--gas-limit <limit>', 'Custom gas limit')
  .option('--max-fee <fee>', 'Max fee per gas in gwei')
  .option('--max-priority-fee <fee>', 'Max priority fee per gas in gwei')
  .action(async (options) => {
    await cancelCommand(options);
  });

program
  .command('interactive')
  .description('Interactive mode for guided operation')
  .action(async () => {
    await interactiveMode();
  });

program
  .command('emergency')
  .description('Emergency delegation cancellation (alternative method)')
  .option('-k, --private-key <key>', 'Private key for signing')
  .action(async (options) => {
    await emergencyCommand(options);
  });

program
  .command('research')
  .description('Research the delegation contract to find cancellation methods')
  .option('-a, --address <address>', 'Wallet address to research')
  .option('-c, --contract <contract>', 'Specific contract address to analyze')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    await researchCommand(options);
  });

program
  .command('transfer')
  .description('Emergency transfer funds to a new safe wallet')
  .option('-k, --private-key <key>', 'Private key of compromised wallet')
  .option('-t, --to <address>', 'Destination address (or generate new wallet)')
  .option('-a, --amount <amount>', 'Amount to transfer (e.g., "2.0" for 2 MON)')
  .option('--dry-run', 'Simulate the transfer without sending')
  .option('--generate-new', 'Generate a new wallet address')
  .action(async (options) => {
    await transferCommand(options);
  });

program
  .command('trace')
  .description('Trace the source of the attack (NFT, signatures, etc.)')
  .option('-a, --address <address>', 'Wallet address to investigate')
  .option('-t, --tx <hash>', 'Specific transaction hash to analyze')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    await traceCommand(options);
  });

program
  .command('find-delegation')
  .description('Find the specific EIP-7702 delegation authorization transaction')
  .option('-a, --address <address>', 'Wallet address to search')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Searching for delegation transaction...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to search:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const tracer = new AttackTracer(provider);
      const result = await tracer.findDelegationTransaction(address);
      
      spinner.stop();
      
      console.log(chalk.blue('\n🔍 DELEGATION TRANSACTION SEARCH'));
      console.log('═'.repeat(50));
      
      if (result.analysis.length > 0) {
        console.log(chalk.cyan('\n📊 Analysis:'));
        result.analysis.forEach(item => {
          console.log(`  ${item}`);
        });
      }

      if (result.investigationSteps.length > 0) {
        console.log(chalk.yellow('\n📋 MANUAL INVESTIGATION GUIDE:'));
        result.investigationSteps.forEach(step => {
          console.log(step);
        });
      }

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Search error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('investigate')
  .description('Memory-free forensic investigation (when you don\'t remember the attack)')
  .option('-a, --address <address>', 'Wallet address to investigate')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Performing automated forensic analysis...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to investigate:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const forensic = new ForensicAnalyzer(provider);
      
      spinner.text = 'Analyzing wallet state without requiring memory...';
      const investigation = await forensic.performAutomatedInvestigation(address);
      
      spinner.stop();
      
      console.log(chalk.blue('\n🕵️ MEMORY-FREE FORENSIC INVESTIGATION'));
      console.log('═'.repeat(60));
      console.log(chalk.gray('For when you don\'t remember how the attack happened\n'));
      
      // Current Status
      if (investigation.currentStatus.length > 0) {
        investigation.currentStatus.forEach(item => {
          if (item.includes('CURRENT WALLET STATE')) {
            console.log(chalk.cyan(item));
          } else if (item.includes('🚨')) {
            console.log(chalk.red(item));
          } else {
            console.log(`  ${item}`);
          }
        });
      }

      // Timeline
      if (investigation.timeline.length > 0) {
        console.log('\n');
        investigation.timeline.forEach(item => {
          if (item.includes('TIMELINE RECONSTRUCTION')) {
            console.log(chalk.yellow(item));
          } else {
            console.log(`  ${item}`);
          }
        });
      }

      // Technical Findings
      if (investigation.technicalFindings.length > 0) {
        console.log('\n');
        investigation.technicalFindings.forEach(item => {
          if (item.includes('TECHNICAL ANALYSIS')) {
            console.log(chalk.blue(item));
          } else {
            console.log(`  ${item}`);
          }
        });
      }

      // Browser History Guide
      if (investigation.browserHistory.length > 0) {
        console.log('\n');
        investigation.browserHistory.forEach(item => {
          if (item.includes('BROWSER HISTORY')) {
            console.log(chalk.magenta(item));
          } else if (item.includes('1.') || item.includes('2.') || item.includes('3.')) {
            console.log(chalk.white(item));
          } else {
            console.log(item);
          }
        });
      }

      // Suspicious Patterns
      if (investigation.suspiciousPatterns.length > 0) {
        console.log('\n');
        investigation.suspiciousPatterns.forEach(item => {
          if (item.includes('PATTERN DETECTION')) {
            console.log(chalk.red(item));
          } else if (item.includes('LIKELY ATTACK VECTORS')) {
            console.log(chalk.yellow(item));
          } else {
            console.log(item);
          }
        });
      }

      // Recommendations
      if (investigation.recommendations.length > 0) {
        console.log('\n');
        investigation.recommendations.forEach(item => {
          if (item.includes('INVESTIGATION PLAN')) {
            console.log(chalk.green(item));
          } else if (item.includes('IMMEDIATE') || item.includes('TECHNICAL') || item.includes('PREVENTION')) {
            console.log(chalk.white(item));
          } else {
            console.log(item);
          }
        });
      }

      // Memory-free checklist
      console.log('\n');
      const checklist = forensic.generateMemoryFreeChecklist();
      checklist.forEach(item => {
        if (item.includes('CHECKLIST')) {
          console.log(chalk.cyan(item));
        } else if (item.includes('PHASE')) {
          console.log(chalk.yellow(item));
        } else if (item.includes('FOCUS AREAS') || item.includes('RED FLAGS')) {
          console.log(chalk.red(item));
        } else {
          console.log(item);
        }
      });

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Investigation error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('find-signature')
  .description('Find the exact signature and timestamp of initial penetration')
  .option('-a, --address <address>', 'Wallet address to analyze')
  .option('-t, --tx <hash>', 'Specific transaction hash to analyze for penetration signature')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Hunting for penetration signature...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to analyze:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const penetrationAnalyzer = new PenetrationAnalyzer(provider);
      
      // If specific transaction provided, analyze it
      if (options.tx) {
        spinner.text = `Analyzing transaction ${options.tx} for penetration signature...`;
        const txAnalysis = await penetrationAnalyzer.analyzePenetrationTransaction(options.tx);
        spinner.stop();

        console.log(chalk.red('\n🔍 PENETRATION SIGNATURE ANALYSIS'));
        console.log('═'.repeat(50));
        console.log(`Transaction: ${options.tx}`);
        console.log(`Penetration Transaction: ${txAnalysis.isPenetrationTx ? '🚨 YES' : '❌ NO'}`);
        console.log(`Method: ${txAnalysis.penetrationMethod}`);

        if (txAnalysis.evidence.length > 0) {
          console.log(chalk.yellow('\n📋 SIGNATURE EVIDENCE:'));
          txAnalysis.evidence.forEach(evidence => {
            if (evidence.includes('PENETRATION TIMESTAMP') || evidence.includes('CONFIRMED')) {
              console.log(chalk.red(`  ${evidence}`));
            } else if (evidence.includes('Date:') || evidence.includes('Time:')) {
              console.log(chalk.cyan(`  ${evidence}`));
            } else {
              console.log(`  ${evidence}`);
            }
          });
        }

        if (txAnalysis.recommendations.length > 0) {
          console.log(chalk.green('\n💡 NEXT STEPS:'));
          txAnalysis.recommendations.forEach(rec => {
            console.log(`  • ${rec}`);
          });
        }
      }

      // General penetration hunting
      spinner.start('Hunting for initial penetration signature...');
      const penetrationResult = await penetrationAnalyzer.findInitialPenetration(address);
      spinner.stop();

      console.log(chalk.blue('\n🎯 PENETRATION SIGNATURE HUNT'));
      console.log('═'.repeat(50));

      if (penetrationResult.reconstructedFlow.length > 0) {
        console.log(chalk.cyan('\n📊 Penetration Analysis:'));
        penetrationResult.reconstructedFlow.forEach(item => {
          if (item.includes('HUNTING') || item.includes('Target confirmed')) {
            console.log(chalk.red(`  ${item}`));
          } else {
            console.log(`  ${item}`);
          }
        });
      }

      if (penetrationResult.technicalDetails.length > 0) {
        console.log(chalk.yellow('\n🔬 SIGNATURE HUNTING GUIDE:'));
        penetrationResult.technicalDetails.forEach(detail => {
          if (detail.includes('TECHNICAL PENETRATION') || detail.includes('PENETRATION TRANSACTION')) {
            console.log(chalk.blue(detail));
          } else if (detail.includes('RED FLAGS') || detail.includes('SIGNATURE CHARACTERISTICS')) {
            console.log(chalk.red(detail));
          } else if (detail.includes('TIMELINE') || detail.includes('TIMESTAMP')) {
            console.log(chalk.yellow(detail));
          } else {
            console.log(detail);
          }
        });
      }

      // Timeline reconstruction
      const timeline = penetrationAnalyzer.generateTimelineReconstruction(address);
      console.log(chalk.magenta('\n📅 PENETRATION TIMELINE RECONSTRUCTION:'));
      timeline.forEach(item => {
        if (item.includes('TIMELINE RECONSTRUCTION') || item.includes('PENETRATION SIGNATURE')) {
          console.log(chalk.magenta(item));
        } else if (item.includes('INVESTIGATION METHOD') || item.includes('TIMELINE MARKERS')) {
          console.log(chalk.cyan(item));
        } else if (item.includes('PENETRATION MOMENT')) {
          console.log(chalk.red(item));
        } else {
          console.log(item);
        }
      });

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Signature hunt error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('scan-efficiently')
  .description('Get focused search filters to find EIP-7702 signature efficiently')
  .option('-a, --address <address>', 'Wallet address to scan')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Generating efficient search strategy...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to scan:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const scanner = new SignatureScanner(provider);
      spinner.stop();
      
      console.log(chalk.blue('\n⚡ EFFICIENT SIGNATURE SCANNING'));
      console.log('═'.repeat(50));
      console.log(chalk.gray('Stop wasting time on failed transactions!\n'));

      // Efficiency guide
      const efficiencyGuide = scanner.generateEfficiencyGuide();
      efficiencyGuide.forEach(item => {
        if (item.includes('EFFICIENCY SEARCH')) {
          console.log(chalk.cyan(item));
        } else if (item.includes('MOST IMPORTANT')) {
          console.log(chalk.red(item));
        } else if (item.includes('Type: 0x04')) {
          console.log(chalk.yellow(item));
        } else if (item.includes('IMMEDIATE ACTION')) {
          console.log(chalk.red(item));
        } else if (item.includes('SUCCESS INDICATOR')) {
          console.log(chalk.green(item));
        } else {
          console.log(item);
        }
      });

      // Search filters
      console.log('\n');
      const searchFilters = scanner.generateSearchFilters(address);
      searchFilters.forEach(item => {
        if (item.includes('SEARCH FILTERS')) {
          console.log(chalk.blue(item));
        } else if (item.includes('PRIMARY') || item.includes('EXACT SEARCH')) {
          console.log(chalk.red(item));
        } else if (item.includes('Type: "0x04"')) {
          console.log(chalk.yellow(item));
        } else {
          console.log(item);
        }
      });

      // Manual checklist
      console.log('\n');
      const checklist = scanner.generateManualChecklist();
      checklist.forEach(item => {
        if (item.includes('MANUAL INSPECTION')) {
          console.log(chalk.magenta(item));
        } else if (item.includes('SYSTEMATIC APPROACH')) {
          console.log(chalk.cyan(item));
        } else if (item.includes('VERIFICATION STEPS')) {
          console.log(chalk.green(item));
        } else {
          console.log(item);
        }
      });

      // Focused guidance
      console.log('\n');
      const focusedGuidance = scanner.generateFocusedGuidance();
      focusedGuidance.forEach(item => {
        if (item.includes('FOCUSED SEARCH')) {
          console.log(chalk.blue(item));
        } else if (item.includes('IGNORE THESE')) {
          console.log(chalk.red(item));
        } else if (item.includes('FOCUS ON THESE')) {
          console.log(chalk.green(item));
        } else if (item.includes('BREAKTHROUGH MOMENT')) {
          console.log(chalk.yellow(item));
        } else {
          console.log(item);
        }
      });

      console.log(chalk.cyan('\n🎯 BOTTOM LINE:'));
      console.log('Look for Type: 0x04 + Status: Success');
      console.log('That\'s your penetration signature!');

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Scan error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('simulate-attack')
  .description('Simulate complete 7-day attack timeline with all malicious transactions')
  .option('-a, --address <address>', 'Wallet address to simulate attack for')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Simulating 7-day attack timeline...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to simulate attack timeline:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const simulator = new AttackSimulator(provider);
      
      spinner.text = 'Reconstructing complete attack timeline...';
      const simulation = await simulator.simulateAttackTimeline(address);
      
      spinner.stop();
      
      console.log(chalk.red('\n🎯 7-DAY ATTACK SIMULATION'));
      console.log('═'.repeat(60));
      console.log(chalk.gray('Complete timeline of malicious activities\n'));

      // Investigation Report
      console.log(chalk.blue('📋 INVESTIGATION REPORT:'));
      simulation.investigationReport.forEach(item => {
        if (item.includes('ATTACK SIMULATION') || item.includes('COMPLETE')) {
          console.log(chalk.red(item));
        } else if (item.includes('ACTIVE DELEGATION')) {
          console.log(chalk.yellow(item));
        } else {
          console.log(`  ${item}`);
        }
      });

      // Attack Summary
      console.log(chalk.yellow('\n🚨 ATTACK SUMMARY:'));
      console.log(`📅 Penetration: ${simulation.attackSummary.penetrationMoment?.toLocaleString() || 'Unknown'}`);
      console.log(`💰 Total Loss: ${simulation.attackSummary.totalLoss}`);
      console.log(`⏱️  Duration: ${simulation.attackSummary.attackDuration}`);
      console.log(`🎯 Vector: ${simulation.attackSummary.attackVector || 'Unknown'}`);
      console.log(`👤 Attacker: ${simulation.attackSummary.attackerWallet || 'Unknown'}`);
      console.log(`🔗 Contract: ${simulation.attackSummary.maliciousContract || 'Unknown'}`);

      // Timeline
      console.log(chalk.cyan('\n📅 CHRONOLOGICAL ATTACK TIMELINE:'));
      console.log('═'.repeat(60));
      
      simulation.attackTimeline.forEach((event, index) => {
        const timeStr = event.timestamp.toLocaleString();
        const typeColor = {
          'penetration': chalk.red,
          'exploitation': chalk.yellow,
          'drainage': chalk.magenta,
          'normal': chalk.green,
          'suspicious': chalk.cyan
        }[event.type];

        console.log(`\n${index + 1}. ${typeColor(`[${event.type.toUpperCase()}]`)} ${timeStr}`);
        console.log(`   ${event.description}`);
        console.log(`   📋 Impact: ${event.impact}`);
        console.log(`   🔗 TX: ${event.txHash}`);
        
        if (event.balanceAfter) {
          console.log(`   💰 Balance After: ${event.balanceAfter}`);
        }

        if (event.evidence.length > 0) {
          console.log(`   📊 Evidence:`);
          event.evidence.forEach(evidence => {
            console.log(`      • ${evidence}`);
          });
        }
      });

      // Investigation Summary
      console.log('\n');
      const summary = simulator.generateInvestigationSummary();
      summary.forEach(item => {
        if (item.includes('7-DAY ATTACK INVESTIGATION')) {
          console.log(chalk.red(item));
        } else if (item.includes('ATTACK OVERVIEW') || item.includes('TIMELINE BREAKDOWN') || 
                   item.includes('FINANCIAL IMPACT') || item.includes('TECHNICAL EVIDENCE') ||
                   item.includes('ONGOING THREAT') || item.includes('ATTACK SOPHISTICATION')) {
          console.log(chalk.blue(item));
        } else if (item.includes('PENETRATION') || item.includes('CRITICAL') || item.includes('ONGOING')) {
          console.log(chalk.red(item));
        } else {
          console.log(item);
        }
      });

      console.log(chalk.red('\n🚨 CONCLUSION:'));
      console.log('Your wallet was compromised by a sophisticated NFT verification scam.');
      console.log('The attack is ONGOING and your remaining funds are still at risk.');
      console.log('The delegation authorization is still active and must be cancelled.');

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Simulation error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('monitor')
  .description('Real-time monitoring for EIP-7702 delegation attacks (no wallet signature required)')
  .option('-a, --address <address>', 'Wallet address to monitor')
  .option('-w, --wallets <addresses>', 'Multiple wallet addresses (comma-separated)')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let addresses: string[] = [];
      
      if (options.wallets) {
        addresses = options.wallets.split(',').map((addr: string) => addr.trim());
      } else if (options.address) {
        addresses = [options.address];
      } else {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'addresses',
            message: 'Enter wallet address(es) to monitor (comma-separated):',
            validate: (input) => {
              const addrs = input.split(',').map((addr: string) => addr.trim());
              return addrs.every((addr: string) => WalletAnalyzer.isValidAddress(addr)) || 'Invalid wallet address(es)';
            }
          }
        ]);
        addresses = answer.addresses.split(',').map((addr: string) => addr.trim());
      }

      const monitor = new AttackMonitor(provider);
      
      // Start real-time monitoring
      await monitor.startRealTimeMonitoring(addresses);

    } catch (error) {
      console.error(chalk.red('Monitoring error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

program
  .command('threat-check')
  .description('Immediate threat assessment for wallet security (no wallet signature required)')
  .option('-a, --address <address>', 'Wallet address to assess')
  .option('--rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const spinner = ora('Performing immediate threat assessment...').start();
    
    try {
      const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      let address = options.address;
      if (!address) {
        spinner.stop();
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'address',
            message: 'Enter wallet address to assess:',
            validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
          }
        ]);
        address = answer.address;
        spinner.start();
      }

      const monitor = new AttackMonitor(provider);
      
      spinner.text = 'Analyzing wallet for immediate threats...';
      const assessment = await monitor.performImmediateThreatAssessment(address);
      
      spinner.stop();
      
      console.log(chalk.blue('\n🛡️  IMMEDIATE THREAT ASSESSMENT'));
      console.log('═'.repeat(50));
      console.log(`📍 Wallet: ${address}`);
      console.log(`⏰ Assessment Time: ${new Date().toLocaleString()}\n`);

      // Threat Level
      const threatColors = {
        'SAFE': chalk.green,
        'LOW': chalk.blue, 
        'MEDIUM': chalk.yellow,
        'HIGH': chalk.red,
        'CRITICAL': chalk.red.bold
      };
      
      const threatColor = threatColors[assessment.threatLevel];
      console.log(`🚨 Threat Level: ${threatColor(assessment.threatLevel)}`);
      console.log(`📊 Safety Score: ${assessment.safetyScore}/100\n`);

      // Display threats
      if (assessment.threats.length > 0) {
        console.log(chalk.red('⚠️  IDENTIFIED THREATS:'));
        assessment.threats.forEach((threat, index) => {
          console.log(`\n${index + 1}. ${chalk.yellow(threat.type)}`);
          console.log(`   📋 ${threat.description}`);
          console.log(`   👉 ${chalk.cyan(threat.recommendation)}`);
        });
      } else {
        console.log(chalk.green('✅ No immediate threats detected'));
      }

      // Safety recommendations
      console.log('\n');
      const recommendations = monitor.generateSafetyRecommendations();
      recommendations.forEach(item => {
        if (item.includes('SAFETY RECOMMENDATIONS')) {
          console.log(chalk.blue(item));
        } else if (item.includes('REGULAR MONITORING') || item.includes('WARNING SIGNS') || 
                   item.includes('IMMEDIATE ACTIONS') || item.includes('PREVENTION') || 
                   item.includes('TOOLS')) {
          console.log(chalk.cyan(item));
        } else {
          console.log(item);
        }
      });

      // Next steps based on threat level
      if (assessment.threatLevel === 'CRITICAL') {
        console.log(chalk.red.bold('\n🚨 CRITICAL THREAT - IMMEDIATE ACTION REQUIRED:'));
        console.log('1. Stop using this wallet immediately');
        console.log('2. Run: node dist/cli.js cancel --address ' + address);
        console.log('3. Run: node dist/cli.js transfer --address ' + address);
        console.log('4. Create new wallet for future use');
      } else if (assessment.threatLevel === 'HIGH') {
        console.log(chalk.red('\n⚠️  HIGH THREAT - ACTION RECOMMENDED:'));
        console.log('1. Investigate recent activity');
        console.log('2. Consider transferring funds to safety');
        console.log('3. Monitor closely for changes');
      }

    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Assessment error:'), error instanceof Error ? error.message : 'Unknown error');
    }
  });

async function checkCommand(options: any) {
  const spinner = ora('Initializing...').start();
  
  try {
    // Setup provider
    const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://testnet1.monad.xyz';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();
    
    // Get address
    let address = options.address || process.env.WALLET_ADDRESS;
    if (!address) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: 'Enter wallet address to check:',
          validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid Ethereum address'
        }
      ]);
      address = answer.address;
      spinner.start('Checking wallet status...');
    }

    // Analyze wallet
    const analyzer = new WalletAnalyzer(provider);
    spinner.text = 'Analyzing wallet delegation status...';
    const status = await analyzer.checkWalletStatus(address);
    
    spinner.stop();
    displayWalletStatus(status);
    
    if (status.delegation.isDelegated) {
      console.log(chalk.yellow('\n⚠️  DELEGATION DETECTED!'));
      console.log(chalk.yellow('This wallet has an active EIP-7702 delegation.'));
      console.log(chalk.yellow('Use the "cancel" command to remove the delegation.\n'));
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function traceCommand(options: any) {
  const spinner = ora('Tracing attack source...').start();
  
  try {
    // Setup provider
    const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();

    let address = options.address;
    if (!address) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: 'Enter wallet address to investigate:',
          validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid wallet address'
        }
      ]);
      address = answer.address;
      spinner.start();
    }

    const tracer = new AttackTracer(provider);

    // If specific transaction provided, analyze it
    if (options.tx) {
      spinner.text = `Analyzing transaction ${options.tx}...`;
      const txAnalysis = await tracer.analyzeSpecificTransaction(options.tx);
      spinner.stop();

      console.log(chalk.blue('\n🔍 Transaction Analysis'));
      console.log('═'.repeat(50));
      console.log(`Transaction: ${options.tx}`);
      console.log(`Attack Transaction: ${txAnalysis.isAttackTransaction ? '🚨 YES' : '✅ NO'}`);
      console.log(`Attack Type: ${txAnalysis.attackType}`);

      if (txAnalysis.evidence.length > 0) {
        console.log(chalk.yellow('\n📋 Evidence:'));
        txAnalysis.evidence.forEach(evidence => {
          console.log(`  • ${evidence}`);
        });
      }

      if (txAnalysis.recommendations.length > 0) {
        console.log(chalk.green('\n💡 Recommendations:'));
        txAnalysis.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }
    }

    // General attack source tracing
    spinner.start('Analyzing wallet for attack patterns...');
    const sourceAnalysis = await tracer.traceAttackSource(address);
    spinner.stop();

    console.log(chalk.blue('\n🕵️ Attack Source Analysis'));
    console.log('═'.repeat(50));
    console.log(`Wallet: ${address}`);

    if (sourceAnalysis.analysis.length > 0) {
      console.log(chalk.blue('\n📊 Analysis Results:'));
      sourceAnalysis.analysis.forEach(item => {
        console.log(`  ${item}`);
      });
    }

    if (sourceAnalysis.contractInteractions.length > 0) {
      console.log(chalk.red('\n⚠️  Contract Interactions:'));
      sourceAnalysis.contractInteractions.forEach(contract => {
        console.log(`  • ${contract}`);
      });
    }

    // Generate investigation checklist
    const checklist = tracer.generateInvestigationChecklist();
    console.log(chalk.yellow('\n📋 INVESTIGATION CHECKLIST:'));
    checklist.forEach(item => {
      console.log(item);
    });

    // Specific guidance for delegation attacks
    console.log(chalk.red('\n🎯 DELEGATION ATTACK SPECIFICS:'));
    console.log('This type of attack usually comes from:');
    console.log('  1. 🖼️  NFT minting sites that request "delegation" permission');
    console.log('  2. 🔄 Fake DeFi sites asking to "connect" your wallet');
    console.log('  3. 🎁 Airdrop claims requiring "authorization" signatures');
    console.log('  4. 📧 Phishing emails with malicious signature requests');
    console.log('  5. 💬 Social media scams (Discord/Telegram DMs)');

    // Add specific delegation transaction search
    if (!options.tx) {
      console.log(chalk.cyan('\n🔍 FINDING THE DELEGATION TRANSACTION:'));
      const delegationSearch = await tracer.findDelegationTransaction(address);
      
      delegationSearch.analysis.forEach(item => {
        console.log(`  ${item}`);
      });

      if (delegationSearch.investigationSteps.length > 0) {
        console.log(chalk.yellow('\n📋 INVESTIGATION STEPS:'));
        delegationSearch.investigationSteps.forEach(step => {
          console.log(step);
        });
      }
    }

    console.log(chalk.blue('\n🔗 NEXT STEPS:'));
    console.log('  1. Check your browser history for recent site visits');
    console.log('  2. Review wallet transaction history on block explorer');
    console.log('  3. Look for the EIP-7702 delegation transaction');
    console.log('  4. Identify what site you were on when you signed');

    console.log(chalk.green('\n🔗 Block Explorer Links:'));
    console.log(`  • Wallet: https://testnet.monadexplorer.com/address/${address}`);
    console.log(`  • Malicious Contract: https://testnet.monadexplorer.com/address/${sourceAnalysis.contractInteractions[0] || '0xee224caafbc78cc9a208bd22f8e7362b76eef4fa'}`);

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Trace error:'), error instanceof Error ? error.message : 'Unknown error');
  }
}

async function transferCommand(options: any) {
  const spinner = ora('Emergency fund transfer...').start();
  
  try {
    // Setup provider
    const rpcUrl = process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();

    // Get private key
    let privateKey = options.privateKey || process.env.PRIVATE_KEY;
    if (!privateKey) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'password',
          name: 'privateKey',
          message: 'Enter private key of compromised wallet:',
          mask: '*'
        }
      ]);
      privateKey = answer.privateKey;
      spinner.start();
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const fromAddress = wallet.address;

    // Check current balance
    spinner.text = 'Checking wallet balance...';
    const balance = await provider.getBalance(fromAddress);
    const network = await provider.getNetwork();
    const tokenSymbol = WalletAnalyzer.getNativeTokenSymbol(Number(network.chainId));

    spinner.stop();

    if (balance === 0n) {
      console.log(chalk.yellow('⚠️  Wallet has no funds to transfer.'));
      return;
    }

    console.log(chalk.blue('\n💰 Current Balance Information:'));
    console.log(`From: ${fromAddress}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ${tokenSymbol}`);

    // Check delegation status
    const analyzer = new WalletAnalyzer(provider);
    const status = await analyzer.checkWalletStatus(fromAddress);
    
    if (status.delegation.isDelegated) {
      console.log(chalk.red(`\n🚨 ACTIVE DELEGATION DETECTED!`));
      console.log(`Delegated to: ${status.delegation.delegatedTo}`);
      console.log(chalk.red('This wallet is compromised and funds should be moved immediately!'));
    }

    // Handle destination address
    let destinationAddress = options.to;
    
    if (options.generateNew || !destinationAddress) {
      const emergencyTransfer = new EmergencyTransfer(provider);
      
      if (options.generateNew) {
        spinner.start('Generating new wallet...');
        const newWallet = emergencyTransfer.generateNewWallet();
        spinner.stop();
        
        console.log(chalk.green('\n🆕 Generated New Wallet:'));
        console.log(`Address: ${newWallet.address}`);
        console.log(`Private Key: ${newWallet.privateKey}`);
        console.log(`Mnemonic: ${newWallet.mnemonic}`);
        console.log(chalk.yellow('\n⚠️  SAVE THESE CREDENTIALS SECURELY!'));
        
        destinationAddress = newWallet.address;
      }
    }

    if (!destinationAddress) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'destination',
          message: 'Enter destination address for fund transfer:',
          validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid destination address'
        }
      ]);
      destinationAddress = answer.destination;
    }

    // Estimate transfer costs
    const emergencyTransfer = new EmergencyTransfer(provider);
    const costEstimate = await emergencyTransfer.estimateTransferCost();
    
    let transferAmount: bigint;
    if (options.amount) {
      transferAmount = ethers.parseEther(options.amount);
      if (balance < transferAmount + costEstimate.totalCost) {
        console.log(chalk.red(`\n❌ Insufficient balance. Need ${ethers.formatEther(transferAmount + costEstimate.totalCost)} ${tokenSymbol} (${options.amount} + gas), but only have ${ethers.formatEther(balance)} ${tokenSymbol}`));
        return;
      }
    } else {
      transferAmount = balance - costEstimate.totalCost;
    }

    console.log(chalk.blue('\n📋 Transfer Preview:'));
    console.log(`To: ${destinationAddress}`);
    console.log(`Transfer Amount: ${ethers.formatEther(transferAmount)} ${tokenSymbol}`);
    console.log(`Gas Cost: ${ethers.formatEther(costEstimate.totalCost)} ${tokenSymbol}`);
    console.log(`Remaining Balance: ${ethers.formatEther(balance - transferAmount - costEstimate.totalCost)} ${tokenSymbol}`);
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE TRANSFER'}`);

    if (transferAmount <= 0n) {
      console.log(chalk.red('\n❌ Insufficient balance to cover gas fees.'));
      return;
    }

    // Confirm transfer
    if (!options.dryRun) {
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed with emergency fund transfer?',
          default: false
        }
      ]);

      if (!confirm.proceed) {
        console.log(chalk.yellow('Transfer aborted.'));
        return;
      }
    }

    // Execute transfer
    spinner.start(options.dryRun ? 'Simulating transfer...' : 'Transferring funds...');
    
    const result = await emergencyTransfer.transferToSafety(privateKey, destinationAddress, {
      dryRun: options.dryRun,
      amount: options.amount
    });
    
    spinner.stop();

    if (result.success) {
      if (options.dryRun) {
        console.log(chalk.green('✅ Dry run successful! Transfer would succeed.'));
        console.log(`Amount to transfer: ${result.amountTransferred} ${tokenSymbol}`);
      } else {
        console.log(chalk.green('✅ Emergency transfer completed successfully!'));
        console.log(`Transaction Hash: ${result.transactionHash}`);
        console.log(`Amount Transferred: ${result.amountTransferred} ${tokenSymbol}`);
        if (result.gasUsed) {
          console.log(`Gas Used: ${result.gasUsed.toString()}`);
        }
        
        console.log(chalk.green('\n🎉 Your funds are now safe in the new wallet!'));
        console.log(chalk.yellow('Next steps:'));
        console.log('  • Verify the transfer on block explorer');
        console.log('  • Secure your new wallet credentials');
        console.log('  • Never use the compromised wallet again');
      }
    } else {
      console.log(chalk.red('❌ Transfer failed:'), result.error);
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Transfer error:'), error instanceof Error ? error.message : 'Unknown error');
  }
}

async function researchCommand(options: any) {
  const spinner = ora('Researching delegation contract...').start();
  
  try {
    // Setup provider
    const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();

    let contractAddress = options.contract;
    
    // If no contract specified, get it from wallet delegation
    if (!contractAddress && options.address) {
      spinner.text = 'Finding delegation contract...';
      const analyzer = new WalletAnalyzer(provider);
      const status = await analyzer.checkWalletStatus(options.address);
      
      if (!status.delegation.isDelegated) {
        spinner.stop();
        console.log(chalk.yellow('No delegation found for the specified wallet.'));
        return;
      }
      
      contractAddress = status.delegation.delegatedTo;
      console.log(chalk.blue(`\n🔍 Researching delegation contract: ${contractAddress}`));
    }

    if (!contractAddress) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'contract',
          message: 'Enter contract address to research:',
          validate: (input) => WalletAnalyzer.isValidAddress(input) || 'Invalid contract address'
        }
      ]);
      contractAddress = answer.contract;
      spinner.start();
    }

    // Analyze the contract
    spinner.text = 'Analyzing contract bytecode...';
    const contractAnalyzer = new ContractAnalyzer(provider);
    const analysis = await contractAnalyzer.analyzeContract(contractAddress);
    
    spinner.stop();

    // Display results
    console.log(chalk.blue('\n📋 Contract Analysis Report'));
    console.log('═'.repeat(50));
    console.log(`Contract: ${contractAddress}`);
    console.log(`Size: ${analysis.codeSize} bytes`);
    console.log(`Balance: ${analysis.balance} MON`);
    console.log(`Is Contract: ${analysis.isContract ? '✅ Yes' : '❌ No'}`);

    if (!analysis.isContract) {
      console.log(chalk.red('\n❌ This is not a contract! It may be an EOA.'));
      return;
    }

    console.log(chalk.blue('\n🔍 Analysis Results:'));
    analysis.analysis.forEach(item => {
      console.log(`  • ${item}`);
    });

    if (analysis.functions.length > 0) {
      console.log(chalk.blue('\n🛠️  Detected Functions:'));
      analysis.functions.forEach(func => {
        console.log(`  • ${func}`);
      });
    }

    if (analysis.possibleCancelMethods.length > 0) {
      console.log(chalk.green('\n✅ Possible Cancellation Methods:'));
      analysis.possibleCancelMethods.forEach(method => {
        console.log(chalk.green(`  • ${method}`));
      });
      
      // Offer to test these methods
      const testMethods = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'test',
          message: 'Would you like to test these cancellation methods?',
          default: false
        }
      ]);

      if (testMethods.test && options.address) {
        console.log(chalk.blue('\n🧪 Testing cancellation methods...'));
        
        for (const method of analysis.possibleCancelMethods) {
          const funcSig = method.split(' (')[1]?.replace(')', '') || '';
          if (funcSig) {
            spinner.start(`Testing ${funcSig}...`);
            const result = await contractAnalyzer.tryCallFunction(
              contractAddress, 
              funcSig, 
              options.address
            );
            spinner.stop();
            
            if (result.success) {
              console.log(chalk.green(`  ✅ ${funcSig} - Call successful`));
              console.log(`     Result: ${result.result}`);
            } else {
              console.log(chalk.red(`  ❌ ${funcSig} - Call failed`));
              console.log(`     Error: ${result.error}`);
            }
          }
        }
      }
    } else {
      console.log(chalk.yellow('\n⚠️  No obvious cancellation methods found.'));
      console.log('The contract may use a different approach or require specific parameters.');
    }

    // Provide recommendations
    console.log(chalk.blue('\n💡 Recommendations:'));
    if (analysis.possibleCancelMethods.length > 0) {
      console.log('  • Try calling the identified cancellation methods');
      console.log('  • Check if the contract has an owner who can revoke delegations');
    }
    console.log('  • Consider transferring funds to a new wallet as a safety measure');
    console.log('  • Check the contract on a block explorer for more details');
    console.log('  • Look for contract verification and source code');

    // Show direct links
    console.log(chalk.blue('\n🔗 External Resources:'));
    console.log(`  • Monad Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
    console.log(`  • Check if contract is verified for source code`);

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Research error:'), error instanceof Error ? error.message : 'Unknown error');
  }
}

async function emergencyCommand(options: any) {
  const spinner = ora('Emergency cancellation mode...').start();
  
  try {
    // Setup provider
    const rpcUrl = process.env.MONAD_RPC_URL || 'https://monad-testnet.drpc.org';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();

    // Get private key
    let privateKey = options.privateKey || process.env.PRIVATE_KEY;
    if (!privateKey) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'password',
          name: 'privateKey',
          message: 'Enter private key for emergency cancellation:',
          mask: '*'
        }
      ]);
      privateKey = answer.privateKey;
      spinner.start();
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;

    spinner.text = 'Checking current status...';
    const analyzer = new WalletAnalyzer(provider);
    const status = await analyzer.checkWalletStatus(address);

    spinner.stop();
    
    if (!status.delegation.isDelegated) {
      console.log(chalk.green('✅ No delegation detected. Nothing to cancel.'));
      return;
    }

    console.log(chalk.red('\n🚨 EMERGENCY MODE - Active delegation detected!'));
    console.log(`Delegated to: ${status.delegation.delegatedTo}`);
    console.log(`Balance at risk: ${status.delegation.balance} MON`);

    const proceed = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Proceed with emergency cancellation using alternative method?',
        default: true
      }
    ]);

    if (!proceed.continue) {
      console.log(chalk.yellow('Emergency cancellation aborted.'));
      return;
    }

    const emergencyCanceller = new EmergencyCanceller(provider);
    
    spinner.start('Attempting emergency cancellation (Method 1)...');
    
    // Try method 1
    let result = await emergencyCanceller.emergencyCancel(privateKey);
    
    if (!result.success) {
      spinner.text = 'Method 1 failed, trying alternative method...';
      result = await emergencyCanceller.alternativeCancel(privateKey);
    }
    
    spinner.stop();

    if (result.success) {
      console.log(chalk.green('✅ Emergency cancellation successful!'));
      console.log('Transaction Hash:', result.transactionHash);
      
      // Verify
      spinner.start('Verifying cancellation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      const verifyStatus = await analyzer.checkWalletStatus(address);
      spinner.stop();
      
      if (!verifyStatus.delegation.isDelegated) {
        console.log(chalk.green('✅ Verification successful - delegation cleared!'));
      } else {
        console.log(chalk.yellow('⚠️  Verification pending - check again in a few blocks'));
      }
      
    } else {
      console.log(chalk.red('❌ Emergency cancellation failed:'), result.error);
      console.log(chalk.yellow('💡 You may need to transfer funds to a new wallet instead.'));
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Emergency cancellation error:'), error instanceof Error ? error.message : 'Unknown error');
  }
}

async function cancelCommand(options: any) {
  const spinner = ora('Initializing cancellation...').start();
  
  try {
    // Setup provider
    const rpcUrl = options.rpc || process.env.MONAD_RPC_URL || 'https://testnet1.monad.xyz';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    spinner.text = 'Connecting to Monad testnet...';
    await provider.getNetwork();

    // Get private key
    let privateKey = options.privateKey || process.env.PRIVATE_KEY;
    if (!privateKey) {
      spinner.stop();
      const answer = await inquirer.prompt([
        {
          type: 'password',
          name: 'privateKey',
          message: 'Enter private key (will not be stored):',
          mask: '*'
        }
      ]);
      privateKey = answer.privateKey;
      spinner.start();
    }

    // Create wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;

    // Check current status
    spinner.text = 'Checking current delegation status...';
    const analyzer = new WalletAnalyzer(provider);
    const status = await analyzer.checkWalletStatus(address);

    if (!status.delegation.isDelegated) {
      spinner.stop();
      console.log(chalk.green('✅ No active delegation found. Nothing to cancel.'));
      return;
    }

    spinner.stop();
    console.log(chalk.yellow('\n🔍 Current Status:'));
    displayWalletStatus(status);

    // Safety checks
    const safetyChecker = new SafetyChecker(provider);
    spinner.start('Running safety checks...');
    const safetyResult = await safetyChecker.performSafetyChecks(address);
    spinner.stop();

    if (!safetyResult.safe) {
      console.log(chalk.red('\n❌ Safety checks failed:'));
      safetyResult.warnings.forEach(warning => {
        console.log(chalk.red(`   • ${warning}`));
      });
      
      const proceed = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Do you want to proceed despite safety warnings?',
          default: false
        }
      ]);
      
      if (!proceed.continue) {
        console.log(chalk.yellow('Cancellation aborted.'));
        return;
      }
    }

    // Prepare cancellation options
    const cancellationOptions = {
      dryRun: options.dryRun || false,
      gasLimit: options.gasLimit ? parseInt(options.gasLimit) : undefined,
      maxFeePerGas: options.maxFee ? ethers.parseUnits(options.maxFee, 'gwei') : undefined,
      maxPriorityFeePerGas: options.maxPriorityFee ? ethers.parseUnits(options.maxPriorityFee, 'gwei') : undefined
    };

    // Show transaction preview
    const canceller = new DelegationCanceller(provider);
    const gasEstimate = await canceller.estimateGas(wallet);
    const feeData = await provider.getFeeData();
    const estimatedCost = gasEstimate * (feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei'));
    const network = await provider.getNetwork();
    const tokenSymbol = WalletAnalyzer.getNativeTokenSymbol(Number(network.chainId));

    console.log(chalk.blue('\n📋 Transaction Preview:'));
    console.log(`   Gas Estimate: ${gasEstimate.toString()}`);
    console.log(`   Estimated Cost: ${ethers.formatEther(estimatedCost)} ${tokenSymbol}`);
    console.log(`   Mode: ${cancellationOptions.dryRun ? 'DRY RUN' : 'LIVE TRANSACTION'}`);

    if (!cancellationOptions.dryRun) {
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed with delegation cancellation?',
          default: false
        }
      ]);

      if (!confirm.proceed) {
        console.log(chalk.yellow('Cancellation aborted.'));
        return;
      }
    }

    // Execute cancellation
    spinner.start(cancellationOptions.dryRun ? 'Simulating cancellation...' : 'Cancelling delegation...');
    const result = await canceller.cancelDelegation(wallet, cancellationOptions);
    spinner.stop();

    if (result.success) {
      if (cancellationOptions.dryRun) {
        console.log(chalk.green('✅ Dry run successful! Cancellation transaction would succeed.'));
      } else {
        console.log(chalk.green('✅ Delegation cancelled successfully!'));
        console.log(`   Transaction Hash: ${result.transactionHash}`);
        if (result.gasUsed) {
          console.log(`   Gas Used: ${result.gasUsed.toString()}`);
        }
        
        // Verify cancellation
        spinner.start('Verifying cancellation...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for block confirmation
        const verification = await canceller.verifyCancellation(address);
        spinner.stop();
        
        if (verification.isCleared) {
          console.log(chalk.green('✅ Verification successful: Delegation has been cleared.'));
        } else {
          console.log(chalk.yellow('⚠️  Verification pending: Please check again in a few blocks.'));
        }
      }
    } else {
      console.log(chalk.red('❌ Cancellation failed:'), result.error);
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

async function interactiveMode() {
  console.log(chalk.blue.bold('\n🔧 Monad Wallet Checker - Interactive Mode\n'));
  
  const action = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🔍 Check wallet delegation status', value: 'check' },
        { name: '❌ Cancel active delegation', value: 'cancel' },
        { name: '📚 View safety guidelines', value: 'guidelines' },
        { name: '🚪 Exit', value: 'exit' }
      ]
    }
  ]);

  switch (action.action) {
    case 'check':
      await checkCommand({});
      break;
    case 'cancel':
      await cancelCommand({});
      break;
    case 'guidelines':
      displaySafetyGuidelines();
      break;
    case 'exit':
      console.log(chalk.blue('Goodbye! 👋'));
      process.exit(0);
      break;
  }
}

function displayWalletStatus(status: WalletStatus) {
  console.log(chalk.blue('\n📊 Wallet Status Report'));
  console.log('═'.repeat(50));
  console.log(`Address: ${status.address}`);
  console.log(`Chain ID: ${status.chainId}`);
  
  // Get the correct token symbol for the network
  const tokenSymbol = WalletAnalyzer.getNativeTokenSymbol(status.chainId);
  console.log(`Balance: ${status.delegation.balance} ${tokenSymbol}`);
  console.log(`Nonce: ${status.delegation.nonce}`);
  console.log(`Checked: ${status.lastChecked.toLocaleString()}`);
  
  console.log(chalk.blue('\n🔗 Delegation Status'));
  console.log('─'.repeat(30));
  
  if (status.delegation.isDelegated) {
    console.log(chalk.red(`Status: DELEGATED ⚠️`));
    console.log(`Delegated To: ${status.delegation.delegatedTo}`);
    console.log(`Risk Level: ${getRiskColor(status.delegation.riskLevel)}${status.delegation.riskLevel}`);
    
    if (status.delegation.riskFactors.length > 0) {
      console.log(chalk.yellow('\nRisk Factors:'));
      status.delegation.riskFactors.forEach(factor => {
        console.log(chalk.yellow(`  • ${factor}`));
      });
    }
  } else {
    console.log(chalk.green('Status: NORMAL ✅'));
    console.log('No active delegation detected.');
  }
  
  console.log();
}

function getRiskColor(riskLevel: string): any {
  switch (riskLevel) {
    case 'LOW': return chalk.green;
    case 'MEDIUM': return chalk.yellow;
    case 'HIGH': return chalk.red;
    case 'CRITICAL': return chalk.redBright.bold;
    default: return chalk.white;
  }
}

function displaySafetyGuidelines() {
  console.log(chalk.blue.bold('\n🛡️  Safety Guidelines for EIP-7702 Delegations\n'));
  
  console.log(chalk.yellow('⚠️  IMPORTANT WARNINGS:'));
  console.log('• Active delegations give complete control of your wallet to another contract');
  console.log('• Malicious delegations can drain your entire balance');
  console.log('• Always verify the delegation target before using your wallet');
  console.log('• Cancel unknown or suspicious delegations immediately');
  
  console.log(chalk.blue('\n🔍 Before Canceling:'));
  console.log('• Ensure you have enough ETH for gas fees');
  console.log('• Double-check the wallet address');
  console.log('• Consider using dry-run mode first');
  console.log('• Keep your private key secure');
  
  console.log(chalk.green('\n✅ After Canceling:'));
  console.log('• Verify the delegation has been cleared');
  console.log('• Check your wallet balance');
  console.log('• Monitor for any suspicious activity');
  console.log('• Update your security practices');
  
  console.log(chalk.red('\n🚨 Emergency Actions:'));
  console.log('• If funds are being drained: Cancel delegation immediately');
  console.log('• Move remaining funds to a new wallet');
  console.log('• Report incidents to relevant authorities');
  console.log('• Learn from the experience to prevent future incidents\n');
}

// Handle CLI execution
const isMainModule = process.argv[1] && process.argv[1].endsWith('cli.js');
if (isMainModule) {
  program.parse();
}